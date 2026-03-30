import type { JsonError } from "@/types/common";
import type { WorkerRequest, WorkerResponse, WorkerPayloadBase } from "@/services/worker/types";
import type { JsFormatOptions, JsMinifyOptions, JsCleanOptions } from "@/services/js/transform";

export type JsWorkerPayload =
  | ({ action: "format"; options?: JsFormatOptions } & WorkerPayloadBase)
  | ({ action: "minify"; options?: JsMinifyOptions } & WorkerPayloadBase)
  | ({ action: "clean"; options?: JsCleanOptions } & WorkerPayloadBase);

export type JsWorkerRequest = WorkerRequest<JsWorkerPayload>;

export type JsWorkerResponse = WorkerResponse<JsonError>;
