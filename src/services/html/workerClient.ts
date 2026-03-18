import type { HtmlWorkerPayload, HtmlWorkerResponse } from "@/services/html/worker.types";
import { createWorkerAdapter } from "@/services/worker/adapter";

export const htmlWorkerAdapter = createWorkerAdapter<HtmlWorkerPayload, HtmlWorkerResponse>({
  workerUrl: new URL("../../workers/htmlWorker.ts?worker", import.meta.url),
  idPrefix: "html-worker",
});
