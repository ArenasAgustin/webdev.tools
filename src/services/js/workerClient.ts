import type {
  JsWorkerPayload,
  JsWorkerRequest,
  JsWorkerResponse,
} from "@/services/js/worker.types";
import { createPlaygroundWorkerAdapter } from "@/services/worker/adapter";

const jsWorkerAdapter = createPlaygroundWorkerAdapter<
  JsWorkerPayload,
  JsWorkerRequest,
  JsWorkerResponse
>({
  workerUrl: new URL("../../workers/jsWorker.ts?worker", import.meta.url),
  idPrefix: "js-worker",
  unavailableMessage: "Worker no disponible",
  buildRequest: (id, payload) => ({ id, ...payload }),
});

export const runJsWorker = jsWorkerAdapter.run;

export const preloadJsWorker = () => {
  jsWorkerAdapter.preload();
};
