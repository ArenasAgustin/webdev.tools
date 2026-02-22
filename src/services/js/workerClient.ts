import type {
  JsWorkerPayload,
  JsWorkerRequest,
  JsWorkerResponse,
} from "@/services/js/worker.types";

interface PendingRequest {
  resolve: (value: JsWorkerResponse) => void;
  reject: (error: Error) => void;
}

const pending = new Map<string, PendingRequest>();
let worker: Worker | null = null;

const canUseWorker = () => typeof window !== "undefined" && typeof Worker !== "undefined";

const ensureWorker = () => {
  if (!canUseWorker()) {
    return null;
  }

  if (!worker) {
    worker = new Worker(new URL("../../workers/jsWorker.ts", import.meta.url), {
      type: "module",
    });

    worker.onmessage = (event: MessageEvent<JsWorkerResponse>) => {
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
  `js-worker-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export const runJsWorker = (payload: JsWorkerPayload): Promise<JsWorkerResponse> => {
  const instance = ensureWorker();
  if (!instance) {
    return Promise.reject(new Error("Worker no disponible"));
  }

  const id = createId();
  const message: JsWorkerRequest = { id, ...payload };

  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    instance.postMessage(message);
  });
};
