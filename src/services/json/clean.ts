import { parseJson } from "./parse";
import type { JsonValue, Result, JsonError } from "@/types/common";

/**
 * Remove empty values from JSON:
 * - null, undefined
 * - empty strings
 * - empty arrays
 * - empty objects
 */
function removeEmpty(value: JsonValue): JsonValue | undefined {
  // Handle primitive types
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    const cleaned = value
      .map(removeEmpty)
      .filter((v): v is JsonValue => v !== undefined);
    return cleaned.length > 0 ? cleaned : undefined;
  }

  // Handle objects
  if (typeof value === "object") {
    const cleaned: Record<string, JsonValue> = {};
    for (const [key, val] of Object.entries(value)) {
      const cleanedVal = removeEmpty(val);
      if (cleanedVal !== undefined) {
        cleaned[key] = cleanedVal;
      }
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
export function cleanJson(input: string): Result<string, JsonError> {
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
    const cleaned = removeEmpty(parsed);

    // Check if result is empty after cleaning
    if (cleaned === undefined || cleaned === "") {
      return {
        ok: true,
        value: "",
      };
    }

    // Format result as JSON string
    const formatted = JSON.stringify(cleaned, null, 2);
    return { ok: true, value: formatted };
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
