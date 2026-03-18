import type { CssWorkerPayload, CssWorkerResponse } from "@/services/css/worker.types";
import { createWorkerAdapter } from "@/services/worker/adapter";

export const cssWorkerAdapter = createWorkerAdapter<CssWorkerPayload, CssWorkerResponse>({
  workerUrl: new URL("../../workers/cssWorker.ts?worker", import.meta.url),
  idPrefix: "css-worker",
});
