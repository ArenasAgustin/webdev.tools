import { translate } from "@/i18n/translate";

/**
 * Default time a request may wait for a worker response before it is rejected.
 * Generous on purpose: the same client carries SQL execute, whose first call
 * lazily downloads and compiles sql.js, and long-running queries. It only has to
 * bound requests the worker never answers so callers can fall back or recover.
 */
export const DEFAULT_WORKER_TIMEOUT_MS = 60_000;

interface PendingRequest<TResponse> {
  resolve: (value: TResponse) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout> | null;
}

interface WorkerRequestBase {
  id: string;
}

interface WorkerResponseBase {
  id: string;
}

interface CreateWorkerClientOptions<TPayload, TRequest extends WorkerRequestBase> {
  workerFactory: () => Worker;
  idPrefix: string;
  buildRequest: (id: string, payload: TPayload) => TRequest;
  unavailableMessage?: string;
  /** Per-request timeout in ms. `0` disables it. Defaults to `DEFAULT_WORKER_TIMEOUT_MS`. */
  timeoutMs?: number;
}

export interface WorkerClient<TPayload, TResponse extends WorkerResponseBase> {
  (payload: TPayload): Promise<TResponse>;
  preload: () => void;
  terminate: () => void;
}

export function createWorkerClient<
  TPayload,
  TRequest extends WorkerRequestBase,
  TResponse extends WorkerResponseBase,
>(options: CreateWorkerClientOptions<TPayload, TRequest>): WorkerClient<TPayload, TResponse> {
  const pending = new Map<string, PendingRequest<TResponse>>();
  let worker: Worker | null = null;
  const timeoutMs = options.timeoutMs ?? DEFAULT_WORKER_TIMEOUT_MS;

  const clearTimer = (entry: PendingRequest<TResponse>) => {
    if (entry.timer !== null) {
      clearTimeout(entry.timer);
    }
  };

  const canUseWorker = () => typeof window !== "undefined" && typeof Worker !== "undefined";

  const ensureWorker = () => {
    if (!canUseWorker()) {
      return null;
    }

    if (!worker) {
      worker = options.workerFactory();

      worker.onmessage = (event: MessageEvent<TResponse>) => {
        const response = event.data;
        const entry = pending.get(response.id);
        if (entry) {
          clearTimer(entry);
          entry.resolve(response);
          pending.delete(response.id);
        }
      };

      worker.onerror = (event) => {
        const error = new Error(event.message || "Worker error");
        // Snapshot and clear before rejecting: a reject callback may synchronously
        // call run() → ensureWorker(), which must see an already-cleared pending map.
        const snapshot = new Map(pending);
        pending.clear();
        worker?.terminate();
        worker = null;
        snapshot.forEach((entry) => {
          clearTimer(entry);
          entry.reject(error);
        });

        // Reiniciar el worker en el próximo run
        console.warn("Worker reiniciado después de un error");
      };
    }

    return worker;
  };

  const createId = () =>
    `${options.idPrefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  const run = (payload: TPayload): Promise<TResponse> => {
    const instance = ensureWorker();
    if (!instance) {
      return Promise.reject(
        new Error(options.unavailableMessage ?? translate("services.worker.unavailable")),
      );
    }

    const id = createId();
    const message = options.buildRequest(id, payload);

    return new Promise((resolve, reject) => {
      // Without a timeout, a request the worker never answers (e.g. an
      // unhandled action) would leave the caller waiting forever.
      const timer =
        timeoutMs > 0
          ? setTimeout(() => {
              pending.delete(id);
              reject(new Error(`Worker request timed out after ${timeoutMs}ms`));
            }, timeoutMs)
          : null;

      pending.set(id, { resolve, reject, timer });
      instance.postMessage(message);
    });
  };

  const preload = () => {
    ensureWorker();
  };

  const terminate = () => {
    if (!worker) {
      return;
    }

    worker.terminate();
    worker = null;
    pending.forEach(clearTimer);
    pending.clear();
  };

  return Object.assign(run, { preload, terminate });
}
