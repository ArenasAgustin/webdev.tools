import type { JsonValue } from "@/types/common";

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

/**
 * Common error messages for JSON operations
 */
export const JSON_ERROR_MESSAGES = {
  EMPTY_INPUT: "El JSON está vacío",
} as const;
