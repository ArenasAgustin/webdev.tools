import type { JsonError } from "@/types/common";
import type { IndentStyle } from "@/types/format";
import type { CssMinifyConfig } from "@/types/css";
import type { WorkerPayloadBase, WorkerRequest, WorkerResponse } from "@/services/worker/types";

export interface CssFormatOptions {
  indentSize?: IndentStyle;
}

export type CssMinifyOptions = Partial<Pick<CssMinifyConfig, "removeComments" | "removeSpaces">>;

export type CssWorkerPayload =
  | ({ action: "format"; options?: CssFormatOptions } & WorkerPayloadBase)
  | ({ action: "minify"; options?: CssMinifyOptions } & WorkerPayloadBase);

export type CssWorkerRequest = WorkerRequest<CssWorkerPayload>;

export type CssWorkerResponse = WorkerResponse<JsonError>;
