import type { JsonError } from "@/types/common";
import type { IndentStyle } from "@/types/format";
import type { CssMinifyConfig, CssCleanConfig } from "@/types/css";
import type { WorkerPayloadBase, WorkerRequest, WorkerResponse } from "@/services/worker/types";

export interface CssFormatOptions {
  indentSize?: IndentStyle;
}

export type CssMinifyOptions = Partial<Pick<CssMinifyConfig, "removeComments" | "removeSpaces">>;

export type CssCleanOptions = Partial<
  Pick<CssCleanConfig, "removeEmptyRules" | "removeRulesWithOnlyComments">
>;

export type CssWorkerPayload =
  | ({ action: "format"; options?: CssFormatOptions } & WorkerPayloadBase)
  | ({ action: "minify"; options?: CssMinifyOptions } & WorkerPayloadBase)
  | ({ action: "clean"; options?: CssCleanOptions } & WorkerPayloadBase);

export type CssWorkerRequest = WorkerRequest<CssWorkerPayload>;

export type CssWorkerResponse = WorkerResponse<JsonError>;
