import type { Result } from "@/types/common";
import type { IndentStyle } from "@/types/format";
import { formatWithPrettier } from "@/services/formatter/prettier";

interface CssMinifyOptions {
  removeComments?: boolean;
  removeSpaces?: boolean;
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
