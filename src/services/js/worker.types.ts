import type { JsMinifyOptions } from "@/services/minifier/minifier";
import type { IndentStyle } from "@/types/format";
import type { JsonError } from "@/types/common";
import type { WorkerRequest, WorkerResponse, WorkerPayloadBase } from "@/services/worker/types";

export interface JsFormatOptions {
  indentSize?: IndentStyle;
}

export type JsWorkerPayload =
  | ({ action: "format"; options?: JsFormatOptions } & WorkerPayloadBase)
  | ({ action: "minify"; options?: JsMinifyOptions } & WorkerPayloadBase);

export type JsWorkerRequest = WorkerRequest<JsWorkerPayload>;

export type JsWorkerResponse = WorkerResponse<JsonError>;
