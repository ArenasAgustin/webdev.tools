import type { JsonError } from "@/types/common";
import type { WorkerPayloadBase, WorkerRequest, WorkerResponse } from "@/services/worker/types";
import type { SqlExecuteResult, SqlFormatConfig } from "@/types/sql";

/** Maximum rows returned by a single EXECUTE response */
export const ROW_CAP = 1000;

/** Longest text value (in characters) kept per cell; a BLOB keeps half as many bytes. */
export const CELL_CAP = 10_000;

export type SqlWorkerPayload =
  | ({ action: "format"; options: SqlFormatConfig } & WorkerPayloadBase)
  | ({ action: "validate"; options: SqlFormatConfig } & WorkerPayloadBase)
  | ({ action: "minify" } & WorkerPayloadBase)
  | ({ action: "execute" } & WorkerPayloadBase)
  | ({ action: "load"; input: "" } & WorkerPayloadBase)
  | ({ action: "reset"; input: "" } & WorkerPayloadBase);

export type SqlWorkerRequest = WorkerRequest<SqlWorkerPayload>;

/**
 * Worker responses for SQL operations.
 * format/validate/minify reuse the shared string response shape.
 * execute has a typed payload with the result set.
 */
export type SqlWorkerResponse =
  | WorkerResponse<JsonError>
  | { id: string; ok: true; action: "execute"; value: SqlExecuteResult }
  | { id: string; ok: false; action: "execute"; error: JsonError };
