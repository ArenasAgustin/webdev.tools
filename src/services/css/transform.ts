import type { Result } from "@/types/common";
import type { IndentStyle } from "@/types/format";
import { serviceMessage } from "@/services/serviceMessage";
import { formatWithPrettier } from "@/services/formatter/prettier";
import { parse } from "css-tree";

interface CssMinifyOptions {
  removeComments?: boolean;
  removeSpaces?: boolean;
}

export interface CssCleanOptions {
  removeEmptyRules?: boolean;
  removeRulesWithOnlyComments?: boolean;
}

export function validateCss(input: string): Promise<Result<string, string>> {
  if (!input.trim()) return Promise.resolve({ ok: true, value: "" });

  let errorMessage: string | null = null;

  try {
    parse(input, {
      onParseError(err: { message: string }) {
        errorMessage = err.message;
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Promise.resolve({ ok: false, error: message });
  }

  if (errorMessage !== null) {
    return Promise.resolve({ ok: false, error: errorMessage });
  }

  return Promise.resolve({ ok: true, value: input });
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
    return Promise.resolve({ ok: false, error: message || serviceMessage("services.css.minifyError") });
  }
}

interface CssSegment {
  kind: "literal" | "comment" | "code";
  text: string;
}

// Splits CSS into string literals, unquoted url() bodies, comments and plain code,
// so transforms never treat comment-like text inside a literal as a comment.
function tokenizeCss(source: string): CssSegment[] {
  const segments: CssSegment[] = [];
  let code = "";
  let i = 0;

  const push = (kind: CssSegment["kind"], end: number) => {
    if (code) {
      segments.push({ kind: "code", text: code });
      code = "";
    }
    segments.push({ kind, text: source.slice(i, end) });
    i = end;
  };

  while (i < source.length) {
    const char = source[i];

    if (char === '"' || char === "'") {
      let j = i + 1;
      while (j < source.length && source[j] !== char) {
        j += source[j] === "\\" ? 2 : 1;
      }
      push("literal", Math.min(j + 1, source.length));
      continue;
    }

    if (char === "/" && source[i + 1] === "*") {
      const close = source.indexOf("*/", i + 2);
      push("comment", close === -1 ? source.length : close + 2);
      continue;
    }

    if (/^url\(/i.test(source.slice(i, i + 4)) && !/[\w-]/.test(source[i - 1] ?? "")) {
      const firstArgChar = source.slice(i + 4).trimStart()[0];
      if (firstArgChar !== '"' && firstArgChar !== "'") {
        const close = source.indexOf(")", i + 4);
        push("literal", close === -1 ? source.length : close + 1);
        continue;
      }
    }

    code += char;
    i += 1;
  }

  if (code) segments.push({ kind: "code", text: code });
  return segments;
}

function stripComments(source: string): string {
  return tokenizeCss(source)
    .filter((segment) => segment.kind !== "comment")
    .map((segment) => segment.text)
    .join("");
}

function minifyCssString(source: string): string {
  const preserved: string[] = [];

  // Mask literals and kept comments with private-use placeholders so whitespace
  // rules can't touch them.
  const masked = tokenizeCss(source)
    .map((segment) => {
      if (segment.kind === "code") return segment.text;
      preserved.push(segment.text);
      return `\uE000${preserved.length - 1}\uE001`;
    })
    .join("");

  const compact = masked
    .replace(/\s+/g, " ")
    // Strip spaces around structural punctuation. `:` is handled separately below
    // to avoid collapsing descendant pseudo-selectors (e.g. `a :hover` → `a:hover`).
    .replace(/\s*([{};,>])\s*/g, "$1")
    // Collapse `:` only in declarations (next delimiter is `;` or `}`, not `{`)
    // or inside the parentheses of a feature-query at-rule prelude (`@media (a : b)`).
    // Selector functions such as `:is(.nav :hover)` keep their descendant space.
    .replace(/\s*:\s*(?=[^{};]*[;}])/g, ":")
    .replace(/@(?:media|supports|container|import|custom-media)\b[^{};]*/gi, (prelude) =>
      prelude.replace(/\([^()]*\)/g, (group) => group.replace(/\s*:\s*/g, ":")),
    )
    .replace(/;}/g, "}")
    .trim();

  // Restore with a replacer function so `$&`-style patterns in literals stay verbatim.
  return compact.replace(/\uE000(\d+)\uE001/g, (_, index: string) => preserved[Number(index)]);
}

const CSS_ERROR_MESSAGES = {
  EMPTY_INPUT: serviceMessage("services.css.empty"),
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
    const preserved: string[] = [];

    // Mask literals (n) and comments (n) so braces or
    // comment-like text inside a string never look like a rule.
    let result = tokenizeCss(input)
      .map((segment) => {
        if (segment.kind === "code") return segment.text;
        preserved.push(segment.text);
        const index = preserved.length - 1;
        return segment.kind === "comment" ? `${index}` : `${index}`;
      })
      .join("");

    // The selector part never crosses `;`, so declarations that precede a
    // nested rule are kept.
    const commentOnlyRule = /[^{};]*\{\s*(?:\d+\s*)+\}/g;
    const emptyRule = /[^{};]*\{\s*\}/g;

    // Repeat until stable: removing inner rules can leave an at-rule block empty.
    let previous: string;
    do {
      previous = result;
      if (opts.removeRulesWithOnlyComments) {
        result = result.replace(commentOnlyRule, "");
      }
      if (opts.removeEmptyRules) {
        result = result.replace(emptyRule, "");
      }
    } while (result !== previous);

    // Restore with a replacer function so `$&`-style patterns in literals stay verbatim.
    result = result.replace(
      /[](\d+)[]/g,
      (_, index: string) => preserved[Number(index)],
    );

    // Clean up: remove multiple newlines and trim
    result = result.replace(/\n{3,}/g, "\n\n");
    result = result.trim();

    return { ok: true, value: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: serviceMessage("services.css.cleanError", { message }) };
  }
}
