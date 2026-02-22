import type {
  JsonWorkerPayload,
  JsonWorkerRequest,
  JsonWorkerResponse,
} from "@/services/json/worker.types";
import { createWorkerClient } from "@/services/worker/clientFactory";

export const runJsonWorker = createWorkerClient<
  JsonWorkerPayload,
  JsonWorkerRequest,
  JsonWorkerResponse
>({
  workerUrl: new URL("../../workers/jsonWorker.ts", import.meta.url),
  idPrefix: "json-worker",
  unavailableMessage: "Worker no disponible",
  buildRequest: (id, payload) => ({ id, ...payload }),
});
