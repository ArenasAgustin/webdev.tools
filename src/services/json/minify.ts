import { type Result, type JsonValue, type JsonError } from "@/types/common";
import type { TransformService } from "@/services/transform";
import type { MinifyConfig } from "@/types/json";
import { sortJsonKeys, JSON_ERROR_MESSAGES } from "./utils";

// Export for backward compatibility
export type MinifyOptions = Partial<Pick<MinifyConfig, "removeSpaces" | "sortKeys">>;

/**
 * Minify JSON (remove whitespace)
 * Pure function - no side effects
 */
export function minifyJson(input: string, options: MinifyOptions = {}): Result<string, JsonError> {
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
    const minified =
      options.removeSpaces === false
        ? JSON.stringify(processed, null, 1)
        : JSON.stringify(processed);
    return { ok: true, value: minified };
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

export const minifyJsonTransform: TransformService<MinifyOptions, JsonError> = {
  transform: (input, options = {}) => minifyJson(input, options),
};
