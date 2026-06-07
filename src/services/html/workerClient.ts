import type { HtmlWorkerPayload, HtmlWorkerResponse } from "@/services/html/worker.types";
import { createWorkerAdapter } from "@/services/worker/adapter";

export const htmlWorkerAdapter = createWorkerAdapter<HtmlWorkerPayload, HtmlWorkerResponse>({
  workerFactory: () =>
    new Worker(new URL("../../workers/htmlWorker.ts", import.meta.url), { type: "module" }),
  idPrefix: "html-worker",
});
