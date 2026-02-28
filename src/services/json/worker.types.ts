import type { FormatOptions } from "@/services/formatter/formatter";
import type { MinifyOptions } from "@/services/minifier/minifier";
import type { CleanOptions } from "@/services/json/clean";
import type { JsonError } from "@/types/common";
import type { WorkerRequest, WorkerResponse, WorkerPayloadBase } from "@/services/worker/types";

export type JsonWorkerPayload =
  | ({ action: "format"; options?: FormatOptions } & WorkerPayloadBase)
  | ({ action: "minify"; options?: MinifyOptions } & WorkerPayloadBase)
  | ({ action: "clean"; options?: CleanOptions } & WorkerPayloadBase)
  | ({ action: "jsonPath"; path: string } & WorkerPayloadBase);

export type JsonWorkerRequest = WorkerRequest<JsonWorkerPayload>;

export type JsonWorkerResponse = WorkerResponse<JsonError>;
