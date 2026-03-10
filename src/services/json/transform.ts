import type { Result, JsonValue, JsonError } from "@/types/common";
import type { IndentStyle } from "@/types/format";
import type { JsonCleanConfig } from "@/types/json";
import type { TransformService } from "@/services/transform";
import { formatWithPrettier } from "@/services/formatter/prettier";

/**
 * Common error messages for JSON operations
 */
export const JSON_ERROR_MESSAGES = {
  EMPTY_INPUT: "El JSON está vacío",
} as const;

/**
 * Parse JSON string into JsonValue
 * Pure function - no side effects
 */
export function parseJson(input: string): Result<JsonValue, JsonError> {
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
    return { ok: true, value: parsed };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const match = /position (\d+)/.exec(errorMessage);

    return {
      ok: false,
      error: {
        message: errorMessage,
        line: match ? parseInt(match[1], 10) : undefined,
      },
    };
  }
}

/**
 * Sort JSON object keys recursively
 * Pure function - no side effects
 * @param value - The JSON value to process
 * @returns Processed JSON with sorted keys
 */
export function sortJsonKeys(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map(sortJsonKeys) as JsonValue;
  }
  if (value && typeof value === "object") {
    const sorted: Record<string, JsonValue> = {};
    Object.keys(value)
      .sort()
      .forEach((key) => {
        sorted[key] = sortJsonKeys((value as Record<string, JsonValue>)[key]);
      });
    return sorted as JsonValue;
  }
  return value;
}

export interface JsonFormatOptions {
  indent?: IndentStyle;
  sortKeys?: boolean;
}

export interface JsonMinifyOptions {
  removeSpaces?: boolean;
  sortKeys?: boolean;
}

export type CleanOptions = Partial<JsonCleanConfig>;

export async function formatJson(
  input: string,
  options: JsonFormatOptions = {},
): Promise<Result<string, string>> {
  try {
    if (!input.trim()) {
      return { ok: true, value: "" };
    }

    const parsed = JSON.parse(input) as JsonValue;
    const processed = options.sortKeys ? sortJsonKeys(parsed) : parsed;
    const indent = options.indent ?? 2;
    const formatted = await formatWithPrettier(JSON.stringify(processed), "json-stringify", indent);
    return { ok: true, value: formatted };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message || "Error al formatear JSON" };
  }
}

export function minifyJson(input: string, options: JsonMinifyOptions = {}): Result<string, string> {
  if (!input.trim()) {
    return { ok: true, value: "" };
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
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message || "Error al minificar JSON" };
  }
}

/**
 * Remove empty values from JSON based on options
 */
function removeEmpty(value: JsonValue, options: CleanOptions = {}): JsonValue | undefined {
  const opts = {
    removeNull: options?.removeNull ?? true,
    removeUndefined: options?.removeUndefined ?? true,
    removeEmptyString: options?.removeEmptyString ?? true,
    removeEmptyArray: options?.removeEmptyArray ?? false,
    removeEmptyObject: options?.removeEmptyObject ?? false,
  };

  if (
    (value === null && opts.removeNull) ||
    (value === undefined && opts.removeUndefined) ||
    (value === "" && opts.removeEmptyString)
  ) {
    return undefined;
  }

  if (Array.isArray(value)) {
    const cleaned = value
      .map((v) => removeEmpty(v, options))
      .filter((v): v is JsonValue => v !== undefined);
    if (cleaned.length === 0 && opts.removeEmptyArray) {
      return undefined;
    }
    return cleaned.length > 0 ? cleaned : undefined;
  }

  if (typeof value === "object" && value !== null) {
    const cleaned: Record<string, JsonValue> = {};
    for (const [key, val] of Object.entries(value)) {
      const cleanedVal = removeEmpty(val, options);
      if (cleanedVal !== undefined) {
        cleaned[key] = cleanedVal;
      }
    }
    if (Object.keys(cleaned).length === 0 && opts.removeEmptyObject) {
      return undefined;
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }

  return value;
}

/**
 * Clean empty values from JSON
 * Pure function - no side effects
 */
export function cleanJson(input: string, options: CleanOptions = {}): Result<string, JsonError> {
  if (!input.trim()) {
    return {
      ok: false,
      error: {
        message: JSON_ERROR_MESSAGES.EMPTY_INPUT,
      },
    };
  }

  try {
    const parseResult = parseJson(input);
    if (!parseResult.ok) {
      return parseResult;
    }

    const parsed = parseResult.value;
    const cleaned = removeEmpty(parsed, options);

    if (cleaned === undefined || cleaned === "") {
      return {
        ok: true,
        value: "",
      };
    }

    let result: string;
    if (options.outputFormat === "minify") {
      const minifyResult = minifyJson(JSON.stringify(cleaned), {
        removeSpaces: true,
      });
      if (!minifyResult.ok) {
        return { ok: false, error: { message: minifyResult.error } };
      }
      result = minifyResult.value;
    } else {
      result = JSON.stringify(cleaned, null, 2);
    }

    return { ok: true, value: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      error: {
        message: `Error al limpiar JSON: ${errorMessage}`,
      },
    };
  }
}

export const cleanJsonTransform: TransformService<CleanOptions, JsonError> = {
  transform: (input, options = {}) => cleanJson(input, options),
};
