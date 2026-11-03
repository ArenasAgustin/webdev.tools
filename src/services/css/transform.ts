import type { Result } from "@/types/common";
import type { IndentStyle } from "@/types/format";
import { serviceMessage } from "@/services/serviceMessage";
import { friendlySyntaxError } from "@/services/syntaxErrors";
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

export async function validateCss(input: string): Promise<Result<string, string>> {
  if (!input.trim()) return { ok: true, value: "" };

  // PostCSS (the parser Minify uses) runs first: it reports structural damage with
  // a localized message and its line, and it accepts modern syntax such as nesting.
  const structureError = await findCssSyntaxError(input);
  if (structureError !== null) {
    return { ok: false, error: structureError };
  }

  // css-tree is stricter about selectors and declarations than PostCSS.
  const { source, inserts } = prefixRelativeNestedSelectors(input);
  let errorOffset: number | null = null;

  try {
    parse(source, {
      onParseError(err: { offset: number }) {
        errorOffset ??= err.offset;
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }

  if (errorOffset !== null) {
    // css-tree words its errors in English; report a localized one at the same place.
    const offset = toOriginalOffset(errorOffset, inserts);
    const before = input.slice(0, offset);
    return {
      ok: false,
      error: serviceMessage("services.syntax.atPosition", {
        message: serviceMessage("services.syntax.invalidCss"),
        line: before.split("\n").length,
        column: offset - before.lastIndexOf("\n"),
        frame: "",
      }),
    };
  }

  return { ok: true, value: input };
}

/**
 * css-tree 3 only parses nested style rules whose selectors start with `&`, so valid
 * relaxed nesting (`.a { .b {} }`, `.a { > p {} }`) would read as a parse error.
 * Insert the implicit `& ` before every relative nested selector — the spec gives
 * them that meaning — so css-tree still validates the selector itself.
 */
function prefixRelativeNestedSelectors(input: string): { source: string; inserts: number[] } {
  // Blank out strings, url() bodies and comments so their braces and commas are inert.
  const mask = tokenizeCss(input)
    .map((segment) => (segment.kind === "code" ? segment.text : " ".repeat(segment.text.length)))
    .join("");
  const inserts: number[] = [];
  // Per open block: does it hold declarations (a style rule body) or rules (sheet level)?
  const holdsDeclarations: boolean[] = [];
  let statementStart = 0;
  let depth = 0;

  for (let i = 0; i < mask.length; i++) {
    const char = mask[i];
    if (char === "\\") {
      i += 1;
    } else if (char === "(" || char === "[") {
      depth += 1;
    } else if (char === ")" || char === "]") {
      depth = Math.max(0, depth - 1);
    } else if (depth > 0) {
      continue;
    } else if (char === "{") {
      const inStyleRule = holdsDeclarations.at(-1) ?? false;
      const prelude = mask.slice(statementStart, i).trimStart();
      const isAtRule = prelude.startsWith("@");
      if (inStyleRule && !isAtRule && !prelude.startsWith("--")) {
        inserts.push(...relativeSelectorStarts(mask, statementStart, i));
      }
      // An at-rule nested in a style rule (`@media`) keeps holding declarations.
      holdsDeclarations.push(isAtRule ? inStyleRule : true);
      statementStart = i + 1;
    } else if (char === "}") {
      holdsDeclarations.pop();
      statementStart = i + 1;
    } else if (char === ";") {
      statementStart = i + 1;
    }
  }

  let output = "";
  let last = 0;
  for (const offset of inserts) {
    output += `${input.slice(last, offset)}& `;
    last = offset;
  }
  return { source: output + input.slice(last), inserts };
}

/** Map an offset in the prefixed source back to `input` (each insert adds `& `). */
function toOriginalOffset(offset: number, inserts: number[]): number {
  let shift = 0;
  for (const insert of inserts) {
    if (insert + shift + 2 > offset) break;
    shift += 2;
  }
  return Math.max(0, offset - shift);
}

/** Offsets of the selectors in a nested rule's prelude that do not start with `&`. */
function relativeSelectorStarts(mask: string, start: number, end: number): number[] {
  const starts: number[] = [];
  let itemStart = start;
  let depth = 0;

  const flush = (itemEnd: number) => {
    const first = mask.slice(itemStart, itemEnd).search(/\S/);
    if (first !== -1 && mask[itemStart + first] !== "&") starts.push(itemStart + first);
  };

  for (let i = start; i < end; i++) {
    const char = mask[i];
    if (char === "\\") i += 1;
    else if (char === "(" || char === "[") depth += 1;
    else if (char === ")" || char === "]") depth = Math.max(0, depth - 1);
    else if (char === "," && depth === 0) {
      flush(i);
      itemStart = i + 1;
    }
  }
  flush(end);
  return starts;
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
    return { ok: false, error: friendlySyntaxError(error) ?? message };
  }
}

/**
 * Return the first line of the syntax error PostCSS (via Prettier, already used to
 * format) reports for `input`, or `null` when it parses. PostCSS only rejects
 * structural damage (unclosed blocks, strings, brackets or comments, stray `}`),
 * so modern syntax such as nesting is accepted.
 */
async function findCssSyntaxError(input: string): Promise<string | null> {
  try {
    await formatWithPrettier(input, "css");
    return null;
  } catch (error) {
    // The friendly message drops the code frame: the indicator and Minify show one line.
    const friendly = friendlySyntaxError(error instanceof Error ? error.message.split("\n")[0] : error);
    if (friendly) return friendly;
    const message = error instanceof Error ? error.message : String(error);
    return message.split("\n")[0].trim() || serviceMessage("services.css.minifyError");
  }
}

export async function minifyCss(
  input: string,
  options: CssMinifyOptions = {},
): Promise<Result<string, string>> {
  try {
    if (!input.trim()) {
      return { ok: true, value: "" };
    }

    // Minifying broken CSS would report success on output browsers drop.
    const syntaxError = await findCssSyntaxError(input);
    if (syntaxError) {
      return { ok: false, error: serviceMessage("services.css.syntaxError", { message: syntaxError }) };
    }

    const removeComments = options.removeComments ?? true;
    const removeSpaces = options.removeSpaces ?? true;
    const source = removeComments ? stripComments(input) : input;

    if (!removeSpaces) {
      return { ok: true, value: source.trim() };
    }

    return { ok: true, value: minifyCssString(source).trim() };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message || serviceMessage("services.css.minifyError") };
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

// Characters that would merge into one token with the character after them.
const TOKEN_CHAR = /[\w\-\\\u0080-￿]/;

function stripComments(source: string): string {
  const segments = tokenizeCss(source);
  let output = "";

  segments.forEach((segment, index) => {
    if (segment.kind !== "comment") {
      output += segment.text;
      return;
    }
    // A comment separates tokens: `1px/**/2px` and `div/**/p` must not become
    // `1px2px` and `divp`. It is not whitespace, so `a/**/:hover` stays compound.
    const next = segments.slice(index + 1).find((item) => item.kind !== "comment");
    if (TOKEN_CHAR.test(output.at(-1) ?? "") && TOKEN_CHAR.test(next?.text[0] ?? "")) {
      output += " ";
    }
  });

  return output;
}

// A CSS escape: up to six hex digits plus one optional whitespace, or any one character.
const CSS_ESCAPE = /\\(?:[0-9a-fA-F]{1,6}(?:\r\n|[ \t\r\n\f])?|[\s\S])/g;

function minifyCssString(source: string): string {
  const preserved: string[] = [];

  // Mask literals and kept comments with private-use placeholders so whitespace
  // rules can't touch them.
  const mask = (text: string) => {
    preserved.push(text);
    return `\uE000${preserved.length - 1}\uE001`;
  };
  const masked = tokenizeCss(source)
    .map((segment) =>
      // Escapes are masked too: an escaped space (`.b\ `) or the one whitespace
      // that ends a hex escape (`\31 `) is part of the name, not a combinator.
      segment.kind === "code" ? segment.text.replace(CSS_ESCAPE, mask) : mask(segment.text),
    )
    .join("");

  const compact = masked
    .replace(/\s+/g, " ")
    // Strip spaces around structural punctuation. `:` is handled separately below
    // to avoid collapsing descendant pseudo-selectors (e.g. `a :hover` → `a:hover`).
    .replace(/\s*([{};,>])\s*/g, "$1")
    // Padding just inside parentheses is never significant (`rgb( 0 )` → `rgb(0)`).
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    // `+` and `~` are combinators only in selectors (next delimiter is `{`); in
    // declarations `calc(a + b)` needs its spaces. At-rule preludes are skipped.
    .replace(/(^|[{};])([^{};@]*)(?=\{)/g, (_, start: string, selector: string) =>
      start + selector.replace(/\s*([+~])\s*/g, "$1"),
    )
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
