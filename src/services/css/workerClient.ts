import type {
  CssWorkerPayload,
  CssWorkerRequest,
  CssWorkerResponse,
} from "@/services/css/worker.types";
import { createPlaygroundWorkerAdapter } from "@/services/worker/adapter";

const cssWorkerAdapter = createPlaygroundWorkerAdapter<
  CssWorkerPayload,
  CssWorkerRequest,
  CssWorkerResponse
>({
  workerUrl: new URL("../../workers/cssWorker.ts?worker", import.meta.url),
  idPrefix: "css-worker",
  unavailableMessage: "Worker no disponible",
  buildRequest: (id, payload) => ({ id, ...payload }),
});

export const runCssWorker = cssWorkerAdapter.run;

export const preloadCssWorker = () => {
  cssWorkerAdapter.preload();
};
