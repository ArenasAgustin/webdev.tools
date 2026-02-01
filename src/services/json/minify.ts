import { type Result, type JsonValue, type JsonError } from "@/types/common";

interface MinifyOptions {
  removeSpaces?: boolean;
  sortKeys?: boolean;
}

function sortJsonKeys(value: JsonValue): JsonValue {
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

/**
 * Minify JSON (remove whitespace)
 * Pure function - no side effects
 */
export function minifyJson(
  input: string,
  options: MinifyOptions = {},
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
