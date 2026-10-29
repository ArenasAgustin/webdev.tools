import { translate } from "@/i18n/translate";

/**
 * Default time a request may wait for a worker response before it is rejected.
 * Generous on purpose: the same client carries SQL execute, whose first call
 * lazily downloads and compiles sql.js, and long-running queries. It only has to
 * bound requests the worker never answers so callers can fall back or recover.
 */
export const DEFAULT_WORKER_TIMEOUT_MS = 60_000;

/** Rejection reason for a request the worker did not answer in time. */
export class WorkerTimeoutError extends Error {
  readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    super(`Worker request timed out after ${timeoutMs}ms`);
    this.name = "WorkerTimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

/**
 * Rejection reason when no worker can run here at all (no Worker support, or the
 * worker could not be created). Only then may a caller run the job elsewhere.
 */
export class WorkerUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkerUnavailableError";
  }
}

interface PendingRequest<TRequest, TResponse> {
  message: TRequest;
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

export interface WorkerRunOptions {
  /** Overrides the client's timeout for this request. `0` disables it. */
  timeoutMs?: number;
}

export interface WorkerClient<TPayload, TResponse extends WorkerResponseBase> {
  (payload: TPayload, runOptions?: WorkerRunOptions): Promise<TResponse>;
  preload: () => void;
  terminate: () => void;
}

export function createWorkerClient<
  TPayload,
  TRequest extends WorkerRequestBase,
  TResponse extends WorkerResponseBase,
>(options: CreateWorkerClientOptions<TPayload, TRequest>): WorkerClient<TPayload, TResponse> {
  const pending = new Map<string, PendingRequest<TRequest, TResponse>>();
  let worker: Worker | null = null;
  const timeoutMs = options.timeoutMs ?? DEFAULT_WORKER_TIMEOUT_MS;

  const clearTimer = (entry: PendingRequest<TRequest, TResponse>) => {
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

  /**
   * A worker that misses a deadline is presumed stuck (e.g. a runaway query) and
   * would never read the requests queued behind the expired one, so it is
   * replaced and those requests are handed to the fresh instance.
   */
  const expire = (id: string, ms: number) => {
    const entry = pending.get(id);
    if (!entry) {
      return;
    }
    pending.delete(id);
    worker?.terminate();
    worker = null;
    if (pending.size > 0) {
      const replacement = ensureWorker();
      pending.forEach((other) => replacement?.postMessage(other.message));
    }
    entry.reject(new WorkerTimeoutError(ms));
  };

  const run = (payload: TPayload, runOptions?: WorkerRunOptions): Promise<TResponse> => {
    const unavailable = () =>
      new WorkerUnavailableError(options.unavailableMessage ?? translate("services.worker.unavailable"));
    let instance: Worker | null;
    try {
      instance = ensureWorker();
    } catch {
      return Promise.reject(unavailable());
    }
    if (!instance) {
      return Promise.reject(unavailable());
    }

    const id = createId();
    const message = options.buildRequest(id, payload);

    const requestTimeoutMs = runOptions?.timeoutMs ?? timeoutMs;

    return new Promise((resolve, reject) => {
      // Without a timeout, a request the worker never answers (e.g. an
      // unhandled action or a runaway query) would leave the caller waiting forever.
      const timer =
        requestTimeoutMs > 0 ? setTimeout(() => expire(id, requestTimeoutMs), requestTimeoutMs) : null;

      pending.set(id, { message, resolve, reject, timer });
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
