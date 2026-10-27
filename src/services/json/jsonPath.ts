import { JSONPath } from "jsonpath-plus";
import { JSON_ERROR_MESSAGES } from "./transform";
import { serviceMessage } from "@/services/serviceMessage";
import { type Result, type JsonValue, type JsonError } from "@/types/common";

/**
 * Apply JSONPath filter to JSON data
 * Pure function - no side effects
 */
export function applyJsonPath(input: string, path: string): Result<string, JsonError> {
  if (!input.trim()) {
    return {
      ok: false,
      error: {
        message: JSON_ERROR_MESSAGES.EMPTY_INPUT,
      },
    };
  }

  if (!path.trim()) {
    return {
      ok: false,
      error: {
        message: serviceMessage("services.json.jsonPathEmpty"),
      },
    };
  }

  try {
    // Parse input JSON
    const parsed: unknown = JSON.parse(input) as unknown;

    // Apply JSONPath filter
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = JSONPath({
      path,
      json: parsed as JsonValue,
      wrap: false,
    });

    // wrap:false yields undefined when nothing matches; report it as an empty result
    if (result === undefined) return { ok: true, value: "[]" };

    // Format result as JSON string
    const formatted = JSON.stringify(result, null, 2);
    return { ok: true, value: formatted };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      error: {
        message: serviceMessage("services.json.jsonPathError", { message: errorMessage }),
      },
    };
  }
}
