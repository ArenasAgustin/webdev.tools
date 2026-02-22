import type { JsMinifyOptions } from "@/services/js/minify";

export interface JsFormatOptions {
  indentSize?: number;
}

export type JsWorkerPayload =
  | { action: "format"; input: string; options?: JsFormatOptions }
  | { action: "minify"; input: string; options?: JsMinifyOptions };

export type JsWorkerRequest = { id: string } & JsWorkerPayload;

export interface JsWorkerResponse {
  id: string;
  ok: boolean;
  value?: string;
  error?: { message: string };
}
