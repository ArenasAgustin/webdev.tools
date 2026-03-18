import type { JsonWorkerPayload, JsonWorkerResponse } from "@/services/json/worker.types";
import { createWorkerAdapter } from "@/services/worker/adapter";

export const jsonWorkerAdapter = createWorkerAdapter<JsonWorkerPayload, JsonWorkerResponse>({
  workerUrl: new URL("../../workers/jsonWorker.ts?worker", import.meta.url),
  idPrefix: "json-worker",
});
