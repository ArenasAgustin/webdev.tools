import type { JsonError } from "@/types/common";
import type { WorkerRequest, WorkerResponse, WorkerPayloadBase } from "@/services/worker/types";
import type { JsonFormatOptions, JsonMinifyOptions, CleanOptions } from "@/services/json/transform";

export type JsonWorkerPayload =
  | ({ action: "format"; options?: JsonFormatOptions } & WorkerPayloadBase)
  | ({ action: "minify"; options?: JsonMinifyOptions } & WorkerPayloadBase)
  | ({ action: "clean"; options?: CleanOptions } & WorkerPayloadBase)
  | ({ action: "jsonPath"; path: string } & WorkerPayloadBase);

export type JsonWorkerRequest = WorkerRequest<JsonWorkerPayload>;

export type JsonWorkerResponse = WorkerResponse<JsonError>;
