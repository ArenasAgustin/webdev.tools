import { type Result, type JsonValue, type JsonError } from "@/types/common";
import type { FormatConfig } from "@/types/json";
import { sortJsonKeys, JSON_ERROR_MESSAGES } from "./utils";

// Export for backward compatibility
export type FormatOptions = Partial<Pick<FormatConfig, "indent" | "sortKeys">>;

/**
 * Format JSON with indentation
 * Pure function - no side effects
 */
export function formatJson(input: string, options: FormatOptions = {}): Result<string, JsonError> {
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
    const formatted = JSON.stringify(processed, null, indent);
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
