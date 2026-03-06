import type {
  HtmlWorkerPayload,
  HtmlWorkerRequest,
  HtmlWorkerResponse,
} from "@/services/html/worker.types";
import { createPlaygroundWorkerAdapter } from "@/services/worker/adapter";

const htmlWorkerAdapter = createPlaygroundWorkerAdapter<
  HtmlWorkerPayload,
  HtmlWorkerRequest,
  HtmlWorkerResponse
>({
  workerUrl: new URL("../../workers/htmlWorker.ts?worker", import.meta.url),
  idPrefix: "html-worker",
  unavailableMessage: "Worker no disponible",
  buildRequest: (id, payload) => ({ id, ...payload }),
});

export const runHtmlWorker = htmlWorkerAdapter.run;

export const preloadHtmlWorker = () => {
  htmlWorkerAdapter.preload();
};
