import type {
  JsWorkerPayload,
  JsWorkerRequest,
  JsWorkerResponse,
} from "@/services/js/worker.types";
import { createWorkerClient } from "@/services/worker/clientFactory";

export const runJsWorker = createWorkerClient<JsWorkerPayload, JsWorkerRequest, JsWorkerResponse>({
  workerUrl: new URL("../../workers/jsWorker.ts?worker", import.meta.url),
  idPrefix: "js-worker",
  unavailableMessage: "Worker no disponible",
  buildRequest: (id, payload) => ({ id, ...payload }),
});

export const preloadJsWorker = () => {
  runJsWorker.preload();
};
