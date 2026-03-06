import type {
  JsonWorkerPayload,
  JsonWorkerRequest,
  JsonWorkerResponse,
} from "@/services/json/worker.types";
import { createPlaygroundWorkerAdapter } from "@/services/worker/adapter";

const jsonWorkerAdapter = createPlaygroundWorkerAdapter<
  JsonWorkerPayload,
  JsonWorkerRequest,
  JsonWorkerResponse
>({
  workerUrl: new URL("../../workers/jsonWorker.ts?worker", import.meta.url),
  idPrefix: "json-worker",
  unavailableMessage: "Worker no disponible",
  buildRequest: (id, payload) => ({ id, ...payload }),
});

export const runJsonWorker = jsonWorkerAdapter.run;

export const preloadJsonWorker = () => {
  jsonWorkerAdapter.preload();
};
