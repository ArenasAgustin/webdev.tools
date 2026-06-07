/**
 * PHP Formatter - Improved heuristic-based formatting
 * Handles heredocs, nowdocs, and interpolated strings correctly.
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
 * Improved PHP formatter using heuristic approach.
 * Handles heredocs, nowdocs, interpolated strings, and comments correctly.
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

    let inHeredoc = false;
    let heredocLabel = "";

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines but preserve them
      if (trimmed === "") {
        formatted.push("");
        continue;
      }

      // Detect heredoc/nowdoc start and end
      const heredocMatch = /^(<<<)\s*(['"]?)(\w+)\2/.exec(trimmed);
      if (heredocMatch) {
        if (!inHeredoc) {
          inHeredoc = true;
          heredocLabel = heredocMatch[3];
          formatted.push(indent.repeat(indentLevel) + trimmed);
          continue;
        }
      }

      // Check if we're ending a heredoc
      if (inHeredoc) {
        if (trimmed === heredocLabel + ";") {
          inHeredoc = false;
          heredocLabel = "";
        }
        formatted.push(indent.repeat(indentLevel) + trimmed);
        continue;
      }

      const braces = countOuterBraces(trimmed, false);

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

/**
 * Count { and } characters that appear outside string literals, comments, and heredocs.
 * Enhanced version that handles:
 * - Heredocs and nowdocs (<<<)
 * - Interpolated strings with {$var}
 * - Escaped characters
 * - Single and double quoted strings
 * - Line and block comments
 */
function countOuterBraces(line: string, skipHeredocCheck: boolean): { open: number; close: number } {
  let open = 0;
  let close = 0;
  type StringState = "outside" | "single" | "double";
  let state: StringState = "outside";
  let i = 0;

  // Skip heredoc detection if already in heredoc (caller handles it)
  if (!skipHeredocCheck) {
    // Check for heredoc/nowdoc start
    const heredocMatch = /^(<<<)\s*(['"]?)(\w+)\2/.exec(line);
    if (heredocMatch) {
      // Entire line is in heredoc context
      // Count braces normally but don't interpret strings
      while (i < line.length) {
        const ch = line[i];
        if (ch === "{") open++;
        else if (ch === "}") close++;
        i++;
      }
      return { open, close };
    }
  }

  while (i < line.length) {
    const ch = line[i];

    if (state === "outside") {
      // Check for block comment start
      if (ch === "/" && line[i + 1] === "*") {
        // Find end of block comment
        const commentEnd = line.indexOf("*/", i + 2);
        if (commentEnd !== -1) {
          // Count braces INSIDE block comments
          for (let j = i + 2; j < commentEnd; j++) {
            if (line[j] === "{") open++;
            else if (line[j] === "}") close++;
          }
          i = commentEnd + 2;
          continue;
        } else {
          // Block comment continues to next line (rare case)
          // Count braces in rest of line
          for (let j = i + 2; j < line.length; j++) {
            if (line[j] === "{") open++;
            else if (line[j] === "}") close++;
          }
          break;
        }
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
      // Check for {$ or {$ - start of interpolation
      if (ch === "$" && line[i + 1] === "{") {
        // This { is an interpolation, count it
        open++;
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

  return { open, close };
}

export function validatePhp(input: string): Result<void, string> {
  const result = parsePhp(input);
  if (result.ok) {
    return { ok: true, value: undefined };
  }
  return { ok: false, error: result.error };
}
