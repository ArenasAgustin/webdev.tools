/**
 * PHP Formatter - Browser-compatible implementation
 * Uses simple indentation-based formatting
 */

import type { Result } from "@/types/common";
import type { IndentStyle } from "@/types/format";
import PhpParser from "php-parser";

export interface PhpFormatOptions {
  indentSize?: IndentStyle;
}

type PhpAst = unknown;

export function parsePhp(input: string): Result<PhpAst, string> {
  try {
    if (!input.trim()) {
      return { ok: false, error: "El código PHP está vacío" };
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
      const location = line != null ? ` en línea ${line}` : "";
      return {
        ok: false,
        error: `Error de sintaxis${location}: ${error.message}`,
      };
    }
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message || "Error al parsear código PHP" };
  }
}

/**
 * Simple PHP formatter - works in browser without Node.js dependencies
 * Uses basic indentation rules based on braces and keywords.
 *
 * WARNING: This is a line-based heuristic formatter. It uses a simple
 * odd-quote heuristic to skip brace counting inside string literals, but
 * it cannot handle all edge cases (e.g. heredoc, nested quotes, escaped
 * quotes). For production-grade formatting, a full AST-based tool is
 * recommended.
 */

/** Shown in UI when the formatter's limitations may affect the result. */
export const PHP_FORMATTER_WARNING_DISCLAIMER =
  "Este formateador es heurístico y puede producir indentación incorrecta en código con heredocs, strings complejos o comentarios con llaves.";

/**
 * Count { and } characters that appear outside string literals and line comments.
 * Handles single-quoted strings, double-quoted strings, and // and # comments.
 */
function countOuterBraces(line: string): { open: number; close: number } {
  let open = 0;
  let close = 0;
  type StringState = "outside" | "single" | "double";
  let state: StringState = "outside";

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (state === "outside") {
      if (ch === "'") {
        state = "single";
        continue;
      }
      if (ch === '"') {
        state = "double";
        continue;
      }
      if (ch === "/" && line[i + 1] === "/") break; // line comment
      if (ch === "#") break; // shell-style comment
      if (ch === "{") open++;
      else if (ch === "}") close++;
    } else if (state === "single") {
      if (ch === "\\") {
        i++;
        continue;
      } // skip escaped char
      if (ch === "'") state = "outside";
    } else {
      if (ch === "\\") {
        i++;
        continue;
      } // skip escaped char
      if (ch === '"') state = "outside";
    }
  }

  return { open, close };
}

export function formatPhp(input: string, indentSize: IndentStyle = 2): Result<string, string> {
  try {
    if (!input.trim()) {
      return { ok: true, value: "" };
    }

    const indent = indentSize === "\t" ? "\t" : " ".repeat(indentSize);

    const lines = input.split("\n");
    let indentLevel = 0;
    const formatted: string[] = [];

    const decreaseKeywordsRegex = /^(break|continue|return|throw|goto)\s*;?$/;

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines but preserve them
      if (trimmed === "") {
        formatted.push("");
        continue;
      }

      const braces = countOuterBraces(trimmed);

      // Decrease indent BEFORE for a leading closing brace
      if (trimmed.startsWith("}")) {
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
      const trailingClose = trimmed.startsWith("}") ? braces.close - 1 : braces.close;
      if (trailingClose > 0) {
        indentLevel = Math.max(0, indentLevel - trailingClose);
      }

      // Decrease indent AFTER certain keywords
      if (decreaseKeywordsRegex.exec(trimmed)) {
        if (indentLevel > 0) {
          indentLevel--;
        }
      }
    }

    // Remove trailing empty lines
    while (formatted.length > 0 && formatted[formatted.length - 1] === "") {
      formatted.pop();
    }

    return { ok: true, value: formatted.join("\n") };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message || "Error al formatear código PHP" };
  }
}

export function validatePhp(input: string): Result<void, string> {
  const result = parsePhp(input);
  if (result.ok) {
    return { ok: true, value: undefined };
  }
  return { ok: false, error: result.error };
}
