import { type Result, type JsonValue, type JsonError } from "@/types/common";

/**
 * Format JSON with indentation
 * Pure function - no side effects
 */
export function formatJson(
  input: string,
  indent: number = 2
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
    const formatted = JSON.stringify(parsed, null, indent);
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
