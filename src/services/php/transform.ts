/**
 * PHP Formatter - Improved heuristic-based formatting
 * Handles heredocs, nowdocs, and interpolated strings correctly.
 */

import type { Result } from "@/types/common";
import type { IndentStyle } from "@/types/format";
import { serviceMessage } from "@/services/serviceMessage";
import PhpParser from "php-parser";

export interface PhpFormatOptions {
  indentSize?: IndentStyle;
}

type PhpAst = unknown;

export function parsePhp(input: string): Result<PhpAst, string> {
  try {
    if (!input.trim()) {
      return { ok: false, error: serviceMessage("services.php.empty") };
    }

    const PhpParserFactory = PhpParser as unknown as {
      create: (options: { ast: { withPositions: boolean } }) => {
        parseCode: (code: string) => PhpAst;
      };
    };
    const parser = PhpParserFactory.create({
      ast: {
        withPositions: true,
      },
    });

    const ast = parser.parseCode(input);
    return { ok: true, value: ast };
  } catch (error) {
    if (error instanceof SyntaxError) {
      const line = (error as unknown as { lineNumber?: number }).lineNumber;
      // php-parser reports "Parse Error : syntax error, ... on line N"; our keys
      // already carry the "syntax error" label and the line.
      const message = error.message
        .replace(/^Parse Error\s*:\s*/i, "")
        .replace(/\s+on line \d+\s*$/, "");
      return {
        ok: false,
        error:
          line != null
            ? serviceMessage("services.php.syntaxErrorAtLine", { line, message })
            : serviceMessage("services.php.syntaxError", { message }),
      };
    }
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message || serviceMessage("services.php.parseError") };
  }
}

/**
 * Improved PHP formatter using heuristic approach.
 * Handles heredocs, nowdocs, interpolated strings, and comments correctly.
 */

export function formatPhp(input: string, indentSize: IndentStyle = 2): Result<string, string> {
  try {
    if (!input.trim()) {
      return { ok: true, value: "" };
    }

    // The formatter is heuristic and would happily re-indent broken code; refuse it instead.
    const parsed = parsePhp(input);
    if (!parsed.ok) {
      return { ok: false, error: parsed.error };
    }

    const indent = indentSize === "\t" ? "\t" : " ".repeat(indentSize);

    const lines = input.split("\n");
    let indentLevel = 0;
    const formatted: string[] = [];

    let heredocLabel: string | null = null;
    let inBlockComment = false;

    for (const line of lines) {
      // Heredoc/nowdoc bodies and their closing label are emitted verbatim: their
      // whitespace is part of the string value (and the closing label's indent
      // sets how much PHP strips from the body).
      if (heredocLabel !== null) {
        formatted.push(line);
        if (new RegExp(`^\\s*${heredocLabel}\\b`).test(line)) heredocLabel = null;
        continue;
      }

      const trimmed = line.trim();

      // Skip empty lines but preserve them
      if (trimmed === "") {
        formatted.push("");
        continue;
      }

      // A heredoc/nowdoc opener ends its line, e.g. `$x = <<<EOT` or `f(<<<'TXT'`.
      const heredocMatch = /<<<\s*(['"]?)(\w+)\1$/.exec(trimmed);
      if (heredocMatch) heredocLabel = heredocMatch[2];
      const code = heredocMatch ? trimmed.slice(0, heredocMatch.index) : trimmed;

      const startsInComment = inBlockComment;
      const braces = countOuterBraces(code, inBlockComment);
      inBlockComment = braces.inBlockComment;
      const leadingClose = !startsInComment && trimmed.startsWith("}");

      // Decrease indent BEFORE for a leading closing brace
      if (leadingClose) {
        if (indentLevel > 0) indentLevel--;
      }

      // Apply current indent level
      const indentedLine = indent.repeat(indentLevel) + trimmed;
      formatted.push(indentedLine);

      // Increase indent for opening braces found outside strings
      if (braces.open > 0) {
        indentLevel += braces.open;
      }

      // Decrease for closing braces not already handled above
      const trailingClose = leadingClose ? braces.close - 1 : braces.close;
      if (trailingClose > 0) {
        indentLevel = Math.max(0, indentLevel - trailingClose);
      }
    }

    // Remove trailing empty lines
    while (formatted.length > 0 && formatted[formatted.length - 1] === "") {
      formatted.pop();
    }

    return { ok: true, value: formatted.join("\n") };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message || serviceMessage("services.php.formatError") };
  }
}

/**
 * Count { and } characters that appear outside string literals and comments.
 * Heredoc/nowdoc bodies never reach this function (formatPhp emits them verbatim).
 * Handles:
 * - Interpolated strings with {$var}
 * - Escaped characters
 * - Single and double quoted strings
 * - Line and block comments (a block comment may span lines: `inBlockComment`
 *   says the line starts inside one, and the result says whether it ends inside one)
 */
function countOuterBraces(
  line: string,
  inBlockComment = false,
): { open: number; close: number; inBlockComment: boolean } {
  let open = 0;
  let close = 0;
  type StringState = "outside" | "single" | "double" | "comment";
  let state: StringState = inBlockComment ? "comment" : "outside";
  let i = 0;

  while (i < line.length) {
    const ch = line[i];

    if (state === "outside") {
      // Block comment start: its braces are not code
      if (ch === "/" && line[i + 1] === "*") {
        state = "comment";
        i += 2;
        continue;
      }
      // Line comment
      if (ch === "/" && line[i + 1] === "/") break;
      if (ch === "#") break;

      if (ch === "'") {
        state = "single";
        i++;
        continue;
      }
      if (ch === '"') {
        state = "double";
        i++;
        continue;
      }
      if (ch === "{") {
        open++;
        i++;
        continue;
      }
      if (ch === "}") {
        close++;
        i++;
        continue;
      }
      i++;
    } else if (state === "comment") {
      const commentEnd = line.indexOf("*/", i);
      if (commentEnd === -1) break;
      state = "outside";
      i = commentEnd + 2;
    } else if (state === "single") {
      if (ch === "\\" && i + 1 < line.length) {
        i += 2; // Skip escaped character
        continue;
      }
      if (ch === "'") {
        state = "outside";
      }
      i++;
    } else {
      // double quoted string
      if (ch === "\\" && i + 1 < line.length) {
        i += 2; // Skip escaped character
        continue;
      }
      // `${expr}` interpolation: its braces are part of the string, skip them
      if (ch === "$" && line[i + 1] === "{") {
        i += 2;
        // Find matching }
        let braceCount = 1;
        while (i < line.length && braceCount > 0) {
          if (line[i] === "{") braceCount++;
          else if (line[i] === "}") braceCount--;
          i++;
        }
        continue;
      }
      if (ch === '"') {
        state = "outside";
      }
      i++;
    }
  }

  return { open, close, inBlockComment: state === "comment" };
}

export function validatePhp(input: string): Result<void, string> {
  const result = parsePhp(input);
  if (result.ok) {
    return { ok: true, value: undefined };
  }
  return { ok: false, error: result.error };
}
