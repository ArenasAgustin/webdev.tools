/**
 * Friendly, localizable versions of the syntax errors the formatting libraries throw
 * (PostCSS via Prettier, Prettier's JS and HTML parsers, Terser). The library text is
 * English and terse ("Unexpected token: punc (()"); the known shapes become
 * `services.syntax.*` messages that keep the line, the column and the code frame.
 *
 * This module runs inside workers: it must stay free of i18next imports.
 */

import { serviceMessage } from "@/services/serviceMessage";

type SyntaxKey = `services.syntax.${string}`;

/** PostCSS reasons, as CssSyntaxError words them. */
const POSTCSS_REASONS: [RegExp, SyntaxKey][] = [
  [/^Unclosed block$/, "services.syntax.unclosedBlock"],
  [/^Unclosed string$/, "services.syntax.unclosedString"],
  [/^Unclosed bracket$/, "services.syntax.unclosedBracket"],
  [/^Unclosed comment$/, "services.syntax.unclosedComment"],
  [/^Unexpected \}$/, "services.syntax.unexpectedBrace"],
  [/^Unknown word\b/, "services.syntax.unknownWord"],
];

interface PositionedError {
  line?: unknown;
  col?: unknown;
}

function atPosition(message: string, line: number, column: number, frame: string): string {
  return serviceMessage("services.syntax.atPosition", {
    message,
    line,
    column,
    frame: frame ? `\n${frame}` : "",
  });
}

/**
 * The friendly message for a known library syntax error, or null when the error has
 * another shape (the caller then keeps the original text).
 */
export function friendlySyntaxError(error: unknown): string | null {
  const text = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  if (!text) return null;
  const [firstLine, ...rest] = text.split("\n");
  // Prettier appends a code frame ("> 1 | a { color: red" / "    | ^") after the message.
  const frame = rest.join("\n").trimEnd();

  // PostCSS: "CssSyntaxError: Unclosed block (1:1)", optionally with "<css input>:".
  const postcss = /^(?:CssSyntaxError: )?(?:<css input>:\d+:\d+: )?(.+?) \((\d+):(\d+)\)$/.exec(firstLine);
  if (postcss) {
    const known = POSTCSS_REASONS.find(([pattern]) => pattern.test(postcss[1]));
    if (known) return atPosition(serviceMessage(known[1]), Number(postcss[2]), Number(postcss[3]), frame);
  }

  // Prettier's HTML parser: 'Unexpected closing tag "div". It may happen when … (1:12)'.
  const closingTag = /^Unexpected closing tag "([^"]+)".*\((\d+):(\d+)\)$/.exec(firstLine);
  if (closingTag) {
    return atPosition(
      serviceMessage("services.syntax.unexpectedClosingTag", { tag: closingTag[1] }),
      Number(closingTag[2]),
      Number(closingTag[3]),
      frame,
    );
  }

  // Prettier's JS parser (Babel): "Unexpected token (1:10)".
  const babel = /^Unexpected token \((\d+):(\d+)\)$/.exec(firstLine);
  if (babel) {
    return atPosition(serviceMessage("services.syntax.unexpectedTokenPlain"), Number(babel[1]), Number(babel[2]), frame);
  }

  // Terser: "Unexpected token: punc (()", with line (1-based) and col (0-based) on the error.
  const terser = /^Unexpected token: (\w+) \((.*)\)$/.exec(firstLine);
  if (terser) {
    const message =
      terser[1] === "eof"
        ? serviceMessage("services.syntax.unexpectedEnd")
        : serviceMessage("services.syntax.unexpectedToken", { token: terser[2] });
    const { line, col } = (typeof error === "object" && error !== null ? error : {}) as PositionedError;
    return typeof line === "number" && typeof col === "number"
      ? atPosition(message, line, col + 1, frame)
      : message;
  }

  // PostCSS fails this way on input it cannot build a tree for.
  if (/node type: undefined/i.test(firstLine)) return serviceMessage("services.syntax.invalidCss");

  return null;
}
