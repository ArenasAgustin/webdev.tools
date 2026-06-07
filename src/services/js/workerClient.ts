import type { JsWorkerPayload, JsWorkerResponse } from "@/services/js/worker.types";
import { createWorkerAdapter } from "@/services/worker/adapter";

export const jsWorkerAdapter = createWorkerAdapter<JsWorkerPayload, JsWorkerResponse>({
  workerFactory: () =>
    new Worker(new URL("../../workers/jsWorker.ts", import.meta.url), { type: "module" }),
  idPrefix: "js-worker",
});
