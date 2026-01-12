import { JSONPath } from "jsonpath-plus";
import { type Result, type JsonValue, type JsonError } from "@/types/common";

/**
 * Apply JSONPath filter to JSON data
 * Pure function - no side effects
 */
export function applyJsonPath(
  input: string,
  path: string
): Result<string, JsonError> {
  if (!input.trim()) {
    return {
      ok: false,
      error: {
        message: "El JSON está vacío",
      },
    };
  }

  if (!path.trim()) {
    return {
      ok: false,
      error: {
        message: "La expresión JSONPath está vacía",
      },
    };
  }

  try {
    // Parse input JSON
    const parsed = JSON.parse(input) as JsonValue;

    // Apply JSONPath filter
    const result = JSONPath({
      path,
      json: parsed,
      wrap: false,
    });

    // Format result as JSON string
    const formatted = JSON.stringify(result, null, 2);
    return { ok: true, value: formatted };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      error: {
        message: `Error en JSONPath: ${errorMessage}`,
      },
    };
  }
}
