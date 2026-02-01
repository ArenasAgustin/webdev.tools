import { parseJson } from "./parse";
import { formatJson } from "./format";
import { minifyJson } from "./minify";
import type { JsonValue, Result, JsonError } from "@/types/common";

export interface CleanOptions {
  removeNull?: boolean;
  removeUndefined?: boolean;
  removeEmptyString?: boolean;
  removeEmptyArray?: boolean;
  removeEmptyObject?: boolean;
  outputFormat?: "format" | "minify";
  autoCopy?: boolean;
}

/**
 * Remove empty values from JSON based on options
 */
function removeEmpty(
  value: JsonValue,
  options: CleanOptions = {},
): JsonValue | undefined {
  // Ensure options has default values
  const opts = {
    removeNull: options?.removeNull !== false,
    removeUndefined: options?.removeUndefined !== false,
    removeEmptyString: options?.removeEmptyString !== false,
    removeEmptyArray: options?.removeEmptyArray !== false,
    removeEmptyObject: options?.removeEmptyObject !== false,
  };

  // Handle primitive types
  if (
    (value === null && opts.removeNull) ||
    (value === undefined && opts.removeUndefined) ||
    (value === "" && opts.removeEmptyString)
  ) {
    return undefined;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    const cleaned = value
      .map((v) => removeEmpty(v, options))
      .filter((v): v is JsonValue => v !== undefined);
    if (cleaned.length === 0 && opts.removeEmptyArray) {
      return undefined;
    }
    return cleaned.length > 0 ? cleaned : undefined;
  }

  // Handle objects
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

  // Return primitives as-is (numbers, booleans, etc)
  return value;
}

/**
 * Clean empty values from JSON
 * Pure function - no side effects
 */
export function cleanJson(
  input: string,
  options: CleanOptions = {},
): Result<string, JsonError> {
  if (!input.trim()) {
    return {
      ok: false,
      error: {
        message: "El JSON está vacío",
      },
    };
  }

  try {
    // Parse input JSON
    const parseResult = parseJson(input);
    if (!parseResult.ok) {
      return parseResult;
    }

    const parsed = parseResult.value;

    // Remove empty values
    const cleaned = removeEmpty(parsed, options);

    // Check if result is empty after cleaning
    if (cleaned === undefined || cleaned === "") {
      return {
        ok: true,
        value: "",
      };
    }

    // Format result based on output format option
    let result: string;
    if (options.outputFormat === "minify") {
      const minifyResult = minifyJson(JSON.stringify(cleaned), {
        removeSpaces: true,
      });
      if (!minifyResult.ok) {
        return minifyResult;
      }
      result = minifyResult.value;
    } else {
      const formatResult = formatJson(JSON.stringify(cleaned), {
        indent: 2,
      });
      if (!formatResult.ok) {
        return formatResult;
      }
      result = formatResult.value;
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
