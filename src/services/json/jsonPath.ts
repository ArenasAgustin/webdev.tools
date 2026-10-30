import { JSONPath } from "jsonpath-plus";
import { JSON_ERROR_MESSAGES, isStackOverflow } from "./transform";
import { serviceMessage } from "@/services/serviceMessage";
import { type Result, type JsonValue, type JsonError } from "@/types/common";

// jsonpath-plus caches parsed paths in a plain object keyed by the path text, so a
// path such as "constructor" or "toString" hits an Object.prototype member and fails
// with "cache[expr].concat is not a function". A prototype-less cache avoids that.
JSONPath.cache = Object.create(null) as Record<string, unknown>;

const CLOSING: Record<string, string> = { "[": "]", "(": ")" };

/**
 * True when the path is cut off or unbalanced: an unclosed bracket, parenthesis
 * or quote, a stray closing one, or a trailing "." / "..". jsonpath-plus does
 * not reject these: "$..[" quietly returns the whole document.
 */
function isBrokenJsonPath(path: string): boolean {
  const open: string[] = [];
  let quote: string | null = null;
  for (let i = 0; i < path.length; i++) {
    const char = path[i];
    if (quote) {
      if (char === "\\") i++;
      else if (char === quote) quote = null;
      continue;
    }
    if ((char === "'" || char === '"') && open.length > 0) quote = char;
    else if (char === "[" || char === "(") open.push(CLOSING[char]);
    else if ((char === "]" || char === ")") && open.pop() !== char) return true;
  }
  return quote !== null || open.length > 0 || path.trimEnd().endsWith(".");
}

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

  if (isBrokenJsonPath(path)) {
    return { ok: false, error: { message: serviceMessage("services.json.jsonPathInvalid") } };
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
    // Very deep nesting overflows the engine stack in JSON.parse or jsonpath-plus.
    if (isStackOverflow(error)) {
      return { ok: false, error: { message: serviceMessage("services.json.tooDeep") } };
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      error: {
        message: serviceMessage("services.json.jsonPathError", { message: errorMessage }),
      },
    };
  }
}
