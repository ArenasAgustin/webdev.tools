/**
 * PHP Formatter - Improved heuristic-based formatting
 * Handles heredocs, nowdocs, and interpolated strings correctly.
 */

import type { Result } from "@/types/common";
import type { IndentStyle } from "@/types/format";
import { serviceMessage } from "@/services/serviceMessage";
import PhpParser from "php-parser";
import { PHP_VERSION } from "@/services/php/phpRuntime";

export interface PhpFormatOptions {
  indentSize?: IndentStyle;
}

type PhpAst = unknown;

interface PhpParserInstance {
  parseCode: (code: string) => PhpAst;
  tokenGetAll: (code: string) => PhpToken[];
}

function createPhpParser(): PhpParserInstance {
  const PhpParserFactory = PhpParser as unknown as {
    create: (options: {
      parser: { version: string };
      ast: { withPositions: boolean };
    }) => PhpParserInstance;
  };
  return PhpParserFactory.create({
    // Match the bundled runtime, so PHP 8-only syntax is reported, not run.
    parser: { version: PHP_VERSION },
    ast: {
      withPositions: true,
    },
  });
}

export function parsePhp(input: string): Result<PhpAst, string> {
  try {
    if (!input.trim()) {
      return { ok: false, error: serviceMessage("services.php.empty") };
    }

    // Parse what the runtime will run: tagless code gets the same open tag.
    const ast = createPhpParser().parseCode(toPhpSource(input).source);
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
 * Heuristic PHP formatter: re-indents code lines by brace depth.
 * It works on php-parser's tokens, so braces and line breaks inside strings,
 * heredocs and comments never affect indentation, and lines that start inside
 * a string are emitted verbatim (their whitespace is part of the value), as
 * are inline HTML lines.
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
    const layout = analyzePhpLines(input, lines);
    let indentLevel = 0;
    const formatted: string[] = [];

    lines.forEach((line, index) => {
      const { verbatim, leadingClose, open, close } = layout[index];

      if (verbatim) {
        formatted.push(line.replace(/\r$/, ""));
        indentLevel = Math.max(0, indentLevel + open - close);
        return;
      }

      const trimmed = line.trim();

      // Skip empty lines but preserve them
      if (trimmed === "") {
        formatted.push("");
        return;
      }

      // Decrease indent BEFORE for a leading closing brace
      if (leadingClose && indentLevel > 0) indentLevel--;

      formatted.push(indent.repeat(indentLevel) + trimmed);

      // Then apply the line's other braces
      const trailingClose = leadingClose ? close - 1 : close;
      indentLevel = Math.max(0, indentLevel + open - trailingClose);
    });

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

interface PhpLineLayout {
  /** The line starts inside a string or inline HTML, so it is emitted unchanged. */
  verbatim: boolean;
  /** The line's first token (after any open tag) is a code `}`. */
  leadingClose: boolean;
  /** Code braces on the line (never ones inside strings or comments). */
  open: number;
  close: number;
}

type PhpToken = string | [name: string, text: string, line: number];

/**
 * Tagless code runs as PHP (the runtime adds an open tag), so it is tokenized
 * the same way; `prefixLength` maps token offsets back to `input`.
 */
function toPhpSource(input: string): { source: string; prefixLength: number } {
  if (/<\?(php\b|=)/i.test(input)) return { source: input, prefixLength: 0 };
  const prefix = "<?php ";
  return { source: prefix + input, prefixLength: prefix.length };
}

function analyzePhpLines(input: string, lines: string[]): PhpLineLayout[] {
  const { source, prefixLength } = toPhpSource(input);
  const tokens = createPhpParser().tokenGetAll(source);

  const layout: PhpLineLayout[] = lines.map(() => ({
    verbatim: false,
    leadingClose: false,
    open: 0,
    close: 0,
  }));
  const lineStarts: number[] = [];
  let lineStart = prefixLength;
  for (const line of lines) {
    lineStarts.push(lineStart);
    lineStart += line.length + 1;
  }
  let offset = 0;
  let nextLine = 0;
  let inString = false;
  // Last line holding a token other than whitespace or an open tag.
  let lastContentLine = -1;
  for (const token of tokens) {
    const [name, text] = typeof token === "string" ? [token, token] : token;
    const start = offset;
    const end = start + text.length;
    offset = end;

    // Lines starting at or inside this token are verbatim when inside a string
    // or inline HTML (template markup keeps the author's own indentation).
    let tokenLine = nextLine - 1;
    while (nextLine < lineStarts.length && lineStarts[nextLine] < end) {
      const midToken = lineStarts[nextLine] > start;
      if (midToken && name === "T_CONSTANT_ENCAPSED_STRING") layout[nextLine].verbatim = true;
      if (inString || name === "T_INLINE_HTML") layout[nextLine].verbatim = true;
      if (!midToken) tokenLine = nextLine;
      nextLine++;
    }

    const isContent = name !== "T_WHITESPACE" && name !== "T_OPEN_TAG";
    const firstOnLine = isContent && tokenLine > lastContentLine;
    if (isContent) lastContentLine = nextLine - 1;

    if (name === '"' || name === "`") inString = !inString;
    else if (name === "T_START_HEREDOC") inString = true;
    else if (name === "T_END_HEREDOC") inString = false;
    // Interpolation braces (`{$a}`, `${a}`) are part of the string.
    else if (!inString && tokenLine >= 0 && (name === "{" || name === "}")) {
      const line = layout[tokenLine];
      if (name === "{") {
        line.open++;
      } else {
        line.close++;
        // `<?php } ?>` closes its block like a bare `}` line does.
        if (firstOnLine) line.leadingClose = true;
      }
    }
  }

  return layout;
}

export function validatePhp(input: string): Result<void, string> {
  const result = parsePhp(input);
  if (result.ok) {
    return { ok: true, value: undefined };
  }
  return { ok: false, error: result.error };
}
