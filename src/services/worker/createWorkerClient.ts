import type { WorkerPayloadBase, WorkerRequest, WorkerResponse } from "./types";

/**
 * Factory para crear un worker client genérico para playgrounds
 * @param workerUrl URL del worker (usualmente import.meta.url)
 */
export function createWorkerClientFactory<
  TPayload extends WorkerPayloadBase,
  TResponse extends WorkerResponse,
>(workerUrl: URL) {
  return {
    run: (payload: TPayload): Promise<TResponse> => {
      return new Promise((resolve, reject) => {
        const worker = new Worker(workerUrl, { type: "module" });
        const id = `worker-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
        const message: WorkerRequest<TPayload> = { id, ...payload };
        worker.onmessage = (event: MessageEvent<TResponse>) => {
          if (event.data.id === id) {
            resolve(event.data);
            worker.terminate();
          }
        };
        worker.onerror = (event) => {
          reject(new Error(event.message || "Worker error"));
          worker.terminate();
        };
        worker.postMessage(message);
      });
    },
    preload: () => {
      // Preload: crea y termina el worker para que el browser lo cachee
      const worker = new Worker(workerUrl, { type: "module" });
      setTimeout(() => worker.terminate(), 100);
    },
    terminate: () => {
      // No-op: cada run crea/termina su worker
    },
  };
}
