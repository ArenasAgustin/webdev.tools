type JsonWorkerAction = "format" | "minify" | "clean" | "jsonPath";

interface JsonWorkerRequest {
  id: string;
  action: JsonWorkerAction;
  input: string;
  options?: unknown;
  path?: string;
}

interface JsonWorkerResponse {
  id: string;
  ok: boolean;
  value?: string;
  error?: { message: string };
}

interface PendingRequest {
  resolve: (value: JsonWorkerResponse) => void;
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
    worker = new Worker(new URL("../../workers/jsonWorker.ts", import.meta.url), {
      type: "module",
    });

    worker.onmessage = (event: MessageEvent<JsonWorkerResponse>) => {
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
  `json-worker-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export const runJsonWorker = (
  payload: Omit<JsonWorkerRequest, "id">,
): Promise<JsonWorkerResponse> => {
  const instance = ensureWorker();
  if (!instance) {
    return Promise.reject(new Error("Worker no disponible"));
  }

  const id = createId();
  const message: JsonWorkerRequest = { id, ...payload };

  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    instance.postMessage(message);
  });
};
