import type { JsWorkerPayload, JsWorkerResponse } from "@/services/js/worker.types";
import { createWorkerAdapter } from "@/services/worker/adapter";

export const jsWorkerAdapter = createWorkerAdapter<JsWorkerPayload, JsWorkerResponse>({
  workerUrl: new URL("../../workers/jsWorker.ts?worker", import.meta.url),
  idPrefix: "js-worker",
});
