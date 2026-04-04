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
 * Uses basic indentation rules based on braces and keywords
 */
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
    const elseKeywordsRegex = /^(else|elseif|catch)\s/;

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines but preserve them
      if (trimmed === "") {
        formatted.push("");
        continue;
      }

      // Decrease indent BEFORE for closing braces
      if (trimmed === "}" || trimmed.startsWith("}")) {
        if (indentLevel > 0) {
          indentLevel--;
        }
      }

      // Apply current indent level
      const indentedLine = indent.repeat(indentLevel) + trimmed;
      formatted.push(indentedLine);

      // Increase indent AFTER opening braces
      if (trimmed.includes("{")) {
        indentLevel++;
      }

      // Decrease indent AFTER certain keywords
      if (decreaseKeywordsRegex.exec(trimmed)) {
        if (indentLevel > 0) {
          indentLevel--;
        }
      }

      // Handle else/elseif on same line
      if (elseKeywordsRegex.exec(trimmed)) {
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
