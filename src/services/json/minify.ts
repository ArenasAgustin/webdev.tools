import { type Result, type JsonValue, type JsonError } from "@/types/common";

/**
 * Minify JSON (remove all whitespace)
 * Pure function - no side effects
 */
export function minifyJson(input: string): Result<string, JsonError> {
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
    const minified = JSON.stringify(parsed);
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
