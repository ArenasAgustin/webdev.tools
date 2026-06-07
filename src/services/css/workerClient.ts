import type { CssWorkerPayload, CssWorkerResponse } from "@/services/css/worker.types";
import { createWorkerAdapter } from "@/services/worker/adapter";

export const cssWorkerAdapter = createWorkerAdapter<CssWorkerPayload, CssWorkerResponse>({
  workerFactory: () =>
    new Worker(new URL("../../workers/cssWorker.ts", import.meta.url), { type: "module" }),
  idPrefix: "css-worker",
});
