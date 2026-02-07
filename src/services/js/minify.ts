import { type Result } from "@/types/common";

/**
 * Minify JavaScript code - remove unnecessary whitespace and comments
 * Pure function - no side effects
 */
export function minifyJs(input: string): Result<string, string> {
  try {
    if (!input.trim()) {
      return { ok: true, value: "" };
    }

    let result = input;

    // Remove single-line comments
    result = result.replace(/\/\/.*?$/gm, "");

    // Remove multi-line comments
    result = result.replace(/\/\*[\s\S]*?\*\//g, "");

    // Remove leading/trailing whitespace from each line
    result = result
      .split("\n")
      .map((line) => line.trim())
      .join("");

    // Collapse multiple spaces, but preserve necessary ones
    result = result.replace(/\s+/g, " ");

    // Remove spaces around operators and punctuation
    result = result.replace(/\s*([{}[\]()=+\-*/<>!&|^~?:;,.])\s*/g, "$1");

    // Restore spaces where necessary (after keywords and before certain tokens)
    result = result.replace(
      /\b(if|else|for|while|do|switch|case|break|continue|return|function|const|let|var|new|delete|typeof|instanceof|in|of|async|await|yield|import|export|default|class|extends|static|super|this|that|true|false|null|undefined)\b/g,
      " $1 ",
    );

    // Clean up multiple spaces
    result = result.replace(/\s+/g, " ");

    // Remove space before semicolons
    result = result.replace(/\s+;/g, ";");

    // Remove space before commas
    result = result.replace(/\s+,/g, ",");

    // Remove spaces inside parentheses
    result = result.replace(/\(\s+/g, "(");
    result = result.replace(/\s+\)/g, ")");

    // Return minified code
    return { ok: true, value: result.trim() };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message };
  }
}
