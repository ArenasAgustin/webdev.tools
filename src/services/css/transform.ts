import type { Result } from "@/types/common";
import type { IndentStyle } from "@/types/format";
import { formatWithPrettier } from "@/services/formatter/prettier";

interface CssMinifyOptions {
  removeComments?: boolean;
  removeSpaces?: boolean;
}

export interface CssCleanOptions {
  removeEmptyRules?: boolean;
  removeRulesWithOnlyComments?: boolean;
}

export async function formatCss(
  input: string,
  indentSize: IndentStyle = 2,
): Promise<Result<string, string>> {
  try {
    if (!input.trim()) {
      return { ok: true, value: "" };
    }

    const formatted = await formatWithPrettier(input, "css", indentSize);
    return { ok: true, value: formatted };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message };
  }
}

export function minifyCss(
  input: string,
  options: CssMinifyOptions = {},
): Promise<Result<string, string>> {
  try {
    if (!input.trim()) {
      return Promise.resolve({ ok: true, value: "" });
    }

    const removeComments = options.removeComments ?? true;
    const removeSpaces = options.removeSpaces ?? true;
    const source = removeComments ? stripComments(input) : input;

    if (!removeSpaces) {
      return Promise.resolve({
        ok: true,
        value: source.trim(),
      });
    }

    const output = minifyCssString(source);

    return Promise.resolve({
      ok: true,
      value: output.trim(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Promise.resolve({ ok: false, error: message || "Error al minificar CSS" });
  }
}

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "");
}

function minifyCssString(source: string): string {
  const preserved = new Map<string, string>();
  let index = 0;

  const withPreservedLiterals = source.replace(
    /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g,
    (match) => {
      const token = `__CSS_LITERAL_${index}__`;
      index += 1;
      preserved.set(token, match);
      return token;
    },
  );

  const compact = withPreservedLiterals
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>+~])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();

  let restored = compact;
  for (const [token, literal] of preserved.entries()) {
    restored = restored.replace(new RegExp(token, "g"), literal);
  }

  return restored;
}

const CSS_ERROR_MESSAGES = {
  EMPTY_INPUT: "El CSS está vacío",
} as const;

/**
 * Clean empty CSS rules
 * Pure function - no side effects
 */
export function cleanCss(input: string, options: CssCleanOptions = {}): Result<string, string> {
  if (!input.trim()) {
    return {
      ok: false,
      error: CSS_ERROR_MESSAGES.EMPTY_INPUT,
    };
  }

  const opts = {
    removeEmptyRules: options?.removeEmptyRules ?? true,
    removeRulesWithOnlyComments: options?.removeRulesWithOnlyComments ?? true,
  };

  try {
    let result = input;

    // First, handle rules with only comments
    if (opts.removeRulesWithOnlyComments) {
      // Match selectors with only comments inside: selector { /* comment */ }
      result = result.replace(/([^{}]*?)\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "");
    }

    // Remove empty rules: selector { }
    if (opts.removeEmptyRules) {
      // Match rules with only whitespace: selector { }
      result = result.replace(/[^{}]*?\{\s*\}/g, "");
    }

    // Clean up: remove multiple newlines and trim
    result = result.replace(/\n{3,}/g, "\n\n");
    result = result.trim();

    return { ok: true, value: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: `Error al limpiar CSS: ${message}` };
  }
}
