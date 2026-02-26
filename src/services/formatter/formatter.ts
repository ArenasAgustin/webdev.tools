import { type Result, type JsonValue, type JsonError } from "@/types/common";
import type { TransformService } from "@/services/transform";
import { formatWithPrettier } from "@/services/formatter/prettier";
import type { FormatConfig } from "@/types/json";
import type { IndentStyle } from "@/types/format";
import { sortJsonKeys, JSON_ERROR_MESSAGES } from "@/services/json/utils";

export type FormatOptions = Partial<Pick<FormatConfig, "indent" | "sortKeys">>;

export async function formatJson(
  input: string,
  options: FormatOptions = {},
): Promise<Result<string, JsonError>> {
  if (!input.trim()) {
    return {
      ok: false,
      error: {
        message: JSON_ERROR_MESSAGES.EMPTY_INPUT,
      },
    };
  }

  try {
    const parsed = JSON.parse(input) as JsonValue;
    const processed = options.sortKeys ? sortJsonKeys(parsed) : parsed;
    const indent = options.indent ?? 2;
    const formatted = await formatWithPrettier(JSON.stringify(processed), "json-stringify", indent);

    return { ok: true, value: formatted };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      error: {
        message: errorMessage,
      },
    };
  }
}

export const formatJsonTransform: TransformService<FormatOptions, JsonError> = {
  transform: async (input, options = {}) => formatJson(input, options),
};

export async function formatJs(
  input: string,
  indentSize: IndentStyle = 2,
): Promise<Result<string, string>> {
  try {
    if (!input.trim()) {
      return { ok: true, value: "" };
    }

    const formatted = await formatWithPrettier(input, "babel", indentSize);
    return { ok: true, value: formatted };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message };
  }
}

export const formatJsTransform: TransformService<IndentStyle, string> = {
  transform: async (input, indentSize = 2) => formatJs(input, indentSize),
};
