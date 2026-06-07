import type { SqlWorkerPayload, SqlWorkerResponse } from "@/services/sql/worker.types";
import { createWorkerClient } from "@/services/worker/clientFactory";
import type { WorkerRequest } from "@/services/worker/types";

/**
 * SQL worker adapter — uses createWorkerClient directly to avoid the
 * WorkerResponse<value: string> constraint, since execute responses carry
 * a SqlExecuteResult object as their value.
 */
const run = createWorkerClient<SqlWorkerPayload, WorkerRequest<SqlWorkerPayload>, SqlWorkerResponse>(
  {
    workerUrl: new URL("../../workers/sqlWorker.ts?worker", import.meta.url),
    idPrefix: "sql-worker",
    buildRequest: (id, payload) => ({ id, ...payload }),
  },
);

export const sqlWorkerAdapter = {
  run,
  preload: () => run.preload(),
  terminate: () => run.terminate(),
};
