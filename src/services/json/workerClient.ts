import type { JsonWorkerPayload, JsonWorkerResponse } from "@/services/json/worker.types";
import { createWorkerAdapter } from "@/services/worker/adapter";

export const jsonWorkerAdapter = createWorkerAdapter<JsonWorkerPayload, JsonWorkerResponse>({
  workerFactory: () =>
    new Worker(new URL("../../workers/jsonWorker.ts", import.meta.url), { type: "module" }),
  idPrefix: "json-worker",
});
