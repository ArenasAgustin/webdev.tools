interface PendingRequest<TResponse> {
  resolve: (value: TResponse) => void;
  reject: (error: Error) => void;
}

interface WorkerRequestBase {
  id: string;
}

interface WorkerResponseBase {
  id: string;
}

interface CreateWorkerClientOptions<TPayload, TRequest extends WorkerRequestBase> {
  workerUrl: URL;
  idPrefix: string;
  buildRequest: (id: string, payload: TPayload) => TRequest;
  unavailableMessage?: string;
}

export function createWorkerClient<
  TPayload,
  TRequest extends WorkerRequestBase,
  TResponse extends WorkerResponseBase,
>(options: CreateWorkerClientOptions<TPayload, TRequest>) {
  const pending = new Map<string, PendingRequest<TResponse>>();
  let worker: Worker | null = null;

  const canUseWorker = () => typeof window !== "undefined" && typeof Worker !== "undefined";

  const ensureWorker = () => {
    if (!canUseWorker()) {
      return null;
    }

    if (!worker) {
      worker = new Worker(options.workerUrl, { type: "module" });

      worker.onmessage = (event: MessageEvent<TResponse>) => {
        const response = event.data;
        const entry = pending.get(response.id);
        if (entry) {
          entry.resolve(response);
          pending.delete(response.id);
        }
      };

      worker.onerror = (event) => {
        const error = new Error(event.message || "Worker error");
        pending.forEach((entry) => entry.reject(error));
        pending.clear();
      };
    }

    return worker;
  };

  const createId = () =>
    `${options.idPrefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  return (payload: TPayload): Promise<TResponse> => {
    const instance = ensureWorker();
    if (!instance) {
      return Promise.reject(new Error(options.unavailableMessage ?? "Worker no disponible"));
    }

    const id = createId();
    const message = options.buildRequest(id, payload);

    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      instance.postMessage(message);
    });
  };
}
