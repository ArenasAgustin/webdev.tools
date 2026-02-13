import { type Result, type JsonValue, type JsonError } from "@/types/common";

/**
 * Parse JSON string into JsonValue
 * Pure function - no side effects
 */
export function parseJson(input: string): Result<JsonValue, JsonError> {
  // Empty input is not valid JSON
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
    return { ok: true, value: parsed };
  } catch (error) {
    // Extract line and column from error message if available
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
