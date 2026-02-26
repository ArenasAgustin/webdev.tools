import type { FormatOptions } from "@/services/formatter/formatter";
import type { MinifyOptions } from "@/services/minifier/minifier";
import type { CleanOptions } from "@/services/json/clean";
import type { JsonError } from "@/types/common";

export type JsonWorkerPayload =
  | { action: "format"; input: string; options?: FormatOptions }
  | { action: "minify"; input: string; options?: MinifyOptions }
  | { action: "clean"; input: string; options?: CleanOptions }
  | { action: "jsonPath"; input: string; path: string };

export type JsonWorkerRequest = { id: string } & JsonWorkerPayload;

export interface JsonWorkerResponse {
  id: string;
  ok: boolean;
  value?: string;
  error?: JsonError;
}
