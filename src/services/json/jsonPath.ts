import { JSONPath } from "jsonpath-plus";
import { JSON_ERROR_MESSAGES } from "./transform";
import { serviceMessage } from "@/services/serviceMessage";
import { type Result, type JsonValue, type JsonError } from "@/types/common";

// jsonpath-plus caches parsed paths in a plain object keyed by the path text, so a
// path such as "constructor" or "toString" hits an Object.prototype member and fails
// with "cache[expr].concat is not a function". A prototype-less cache avoids that.
JSONPath.cache = Object.create(null) as Record<string, unknown>;

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

    // Apply JSONPath filter. wrap:true always yields an array of matches, so the
    // output shape doesn't depend on the match count (no matches -> []).
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = JSONPath({
      path,
      json: parsed as JsonValue,
      wrap: true,
    });

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
