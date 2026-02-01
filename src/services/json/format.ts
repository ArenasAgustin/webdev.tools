import { type Result, type JsonValue, type JsonError } from "@/types/common";

interface FormatOptions {
  indent?: number | string;
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
 * Format JSON with indentation
 * Pure function - no side effects
 */
export function formatJson(
  input: string,
  options: FormatOptions = {},
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
