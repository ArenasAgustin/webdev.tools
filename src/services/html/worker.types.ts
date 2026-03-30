import type { JsonError } from "@/types/common";
import type { IndentStyle } from "@/types/format";
import type { HtmlMinifyConfig, HtmlCleanConfig } from "@/types/html";
import type { WorkerPayloadBase, WorkerRequest, WorkerResponse } from "@/services/worker/types";

export interface HtmlFormatOptions {
  indentSize?: IndentStyle;
  formatCss?: boolean;
  formatJs?: boolean;
}

export type HtmlMinifyOptions = Pick<
  HtmlMinifyConfig,
  "removeComments" | "collapseWhitespace" | "minifyCss" | "minifyJs"
>;

export type HtmlCleanOptions = Partial<Pick<HtmlCleanConfig, "removeEmptyTags">>;

export type HtmlWorkerPayload =
  | ({ action: "format"; options?: HtmlFormatOptions } & WorkerPayloadBase)
  | ({ action: "minify"; options?: HtmlMinifyOptions } & WorkerPayloadBase)
  | ({ action: "clean"; options?: HtmlCleanOptions } & WorkerPayloadBase);

export type HtmlWorkerRequest = WorkerRequest<HtmlWorkerPayload>;

export type HtmlWorkerResponse = WorkerResponse<JsonError>;
