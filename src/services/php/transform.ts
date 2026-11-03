/**
 * PHP Formatter - Improved heuristic-based formatting
 * Handles heredocs, nowdocs, and interpolated strings correctly.
 */

import type { Result } from "@/types/common";
import type { IndentStyle } from "@/types/format";
import { serviceMessage } from "@/services/serviceMessage";
import { startsAsPhpFile } from "@/services/php/openTag";
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
 * Heuristic PHP formatter: re-indents statements by block depth (braces, the
 * alternative `if (): … endif;` syntax and switch cases).
 * It works on php-parser's tokens, so braces and line breaks inside strings,
 * heredocs and comments never affect indentation, and lines that start inside
 * a string are emitted verbatim (their whitespace is part of the value), as
 * are inline HTML lines and lines that start with an open tag. Continuation
 * lines (multi-line arrays, call arguments, method chains, comments) keep their original
 * indentation relative to the line they continue.
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

    const rawLines = input.split("\n");
    // Token offsets count each line's `\r`, so the analysis gets the raw lines.
    const layout = analyzePhpLines(input, rawLines);
    const lines = rawLines.map((line) => line.replace(/\r$/, ""));
    const originalIndents = lines.map((line) => /^[ \t]*/.exec(line)?.[0] ?? "");
    const indents: string[] = [];
    // Indentation of the line that opened each open block.
    const openers: string[] = [];
    const formatted: string[] = [];

    lines.forEach((line, index) => {
      const { verbatim, leadingCloses, blocks, anchor } = layout[index];

      let closedOpener: string | undefined;
      for (let i = 0; i < leadingCloses; i++) closedOpener = openers.pop();

      let lineIndent = "";
      if (verbatim) {
        formatted.push(line);
        lineIndent = originalIndents[index];
      } else if (line.trim() === "") {
        // Skip empty lines but preserve them
        formatted.push("");
      } else {
        if (closedOpener !== undefined) {
          // A closing line sits at the level of the line that opened the block
          lineIndent = closedOpener;
        } else if (anchor >= 0) {
          lineIndent = relativeIndent(indents[anchor], originalIndents[anchor], originalIndents[index]);
        } else if (openers.length > 0) {
          lineIndent = openers[openers.length - 1] + indent;
        }
        formatted.push(lineIndent + line.trim());
      }
      indents[index] = lineIndent;

      // Then apply the line's other block changes
      for (const change of blocks) {
        if (change > 0) openers.push(lineIndent);
        else openers.pop();
      }
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

/**
 * Indentation for a line that continues `anchor`: the anchor's new indentation
 * plus whatever the line had beyond the anchor's original indentation.
 */
function relativeIndent(anchorIndent: string, anchorOriginal: string, original: string): string {
  if (original.startsWith(anchorOriginal)) return anchorIndent + original.slice(anchorOriginal.length);
  const width = (text: string) => text.replace(/\t/g, "    ").length;
  return anchorIndent + " ".repeat(Math.max(0, width(original) - width(anchorOriginal)));
}

interface PhpLineLayout {
  /** The line starts inside a string or inline HTML, so it is emitted unchanged. */
  verbatim: boolean;
  /** Blocks closed by the line's first tokens (`}`, `endif;`, `else:`, `case 2:`). */
  leadingCloses: number;
  /** The line's other block opens (1) and closes (-1), in order. */
  blocks: number[];
  /** Line this one continues, keeping its indentation relative to it; -1 for none. */
  anchor: number;
}

type PhpToken = string | [name: string, text: string, line: number];

interface PhpFrame {
  /** `(` and `[` hold continuation lines; blocks hold statements. */
  kind: "bracket" | "brace" | "alt" | "case";
  /** Line that opened the frame. */
  line: number;
  /** For a block: the line where its current statement started, or -1. */
  statementStart: number;
  /** A brace or alternative-syntax block that holds switch cases. */
  switchBody?: boolean;
  /** For a bracket: the control keyword whose condition it holds. */
  condition?: string;
}

/** Keywords followed by a parenthesized condition, which may use the alternative syntax. */
const CONDITION_KEYWORDS = new Set([
  "T_IF",
  "T_ELSEIF",
  "T_WHILE",
  "T_FOR",
  "T_FOREACH",
  "T_SWITCH",
  "T_DECLARE",
]);
const ALT_END_KEYWORDS = new Set([
  "T_ENDIF",
  "T_ENDWHILE",
  "T_ENDFOR",
  "T_ENDFOREACH",
  "T_ENDSWITCH",
  "T_ENDDECLARE",
]);
const NON_CODE_TOKENS = new Set(["T_WHITESPACE", "T_COMMENT", "T_DOC_COMMENT"]);
const TAG_TOKENS = new Set(["T_OPEN_TAG", "T_OPEN_TAG_WITH_ECHO", "T_CLOSE_TAG", "T_INLINE_HTML"]);

/**
 * Tagless code runs as PHP (the runtime adds an open tag), so it is tokenized
 * the same way; `prefixLength` maps token offsets back to `input`.
 */
function toPhpSource(input: string): { source: string; prefixLength: number } {
  if (startsAsPhpFile(input)) return { source: input, prefixLength: 0 };
  const prefix = "<?php ";
  return { source: prefix + input, prefixLength: prefix.length };
}

const tokenName = (token: PhpToken | undefined): string =>
  token === undefined ? "" : typeof token === "string" ? token : token[0];

/** Is the `else`/`elseif` at `index` a branch of the alternative syntax (`else:`)? */
function isAltBranch(tokens: PhpToken[], index: number): boolean {
  let i = index + 1;
  const skip = () => {
    while (NON_CODE_TOKENS.has(tokenName(tokens[i]))) i++;
  };
  skip();
  if (tokenName(tokens[index]) === "T_ELSEIF") {
    if (tokenName(tokens[i]) !== "(") return false;
    let depth = 0;
    for (; i < tokens.length; i++) {
      const name = tokenName(tokens[i]);
      if (name === "(") depth++;
      else if (name === ")" && --depth === 0) break;
    }
    i++;
    skip();
  }
  return tokenName(tokens[i]) === ":";
}

function analyzePhpLines(input: string, lines: string[]): PhpLineLayout[] {
  const { source, prefixLength } = toPhpSource(input);
  const tokens: PhpToken[] = createPhpParser().tokenGetAll(source);

  const layout: PhpLineLayout[] = lines.map(() => ({
    verbatim: false,
    leadingCloses: 0,
    blocks: [],
    anchor: -1,
  }));
  const lineStarts: number[] = [];
  let lineStart = prefixLength;
  for (const line of lines) {
    lineStarts.push(lineStart);
    lineStart += line.length + 1;
  }

  const frames: PhpFrame[] = [{ kind: "brace", line: -1, statementStart: -1 }];
  const top = () => frames[frames.length - 1];
  // Lines that already hold code other than block closers.
  const started = new Set<number>();
  let offset = 0;
  let nextLine = 0;
  let inString = false;
  // The previous code token ended a statement (or nothing came before).
  let terminated = true;
  let previousCode = "";
  let codeIndex = 0;
  // Line whose first token is still to come (it starts with whitespace).
  let pendingLine = -1;
  let expectCondition: string | null = null;
  let conditionEnd: { codeIndex: number; keyword: string } | null = null;
  // Frame count at a `case`/`default` whose label is still open.
  let pendingCase: number | null = null;

  const anchorHere = (): number => {
    const frame = top();
    if (frame.kind === "bracket") return frame.line;
    return terminated ? -1 : frame.statementStart;
  };

  tokens.forEach((token, index) => {
    const [name, text] = typeof token === "string" ? [token, token] : token;
    const start = offset;
    const end = start + text.length;
    offset = end;

    let tokenLine = nextLine - 1;
    if (pendingLine !== -1 && name !== "T_WHITESPACE") {
      layout[pendingLine].anchor = anchorHere();
      pendingLine = -1;
    }
    while (nextLine < lineStarts.length && lineStarts[nextLine] < end) {
      const midToken = lineStarts[nextLine] > start;
      const line = layout[nextLine];
      if (inString || name === "T_INLINE_HTML") line.verbatim = true;
      else if (midToken && name === "T_CONSTANT_ENCAPSED_STRING") line.verbatim = true;
      // An open tag only starts a line after `?>`: whitespace before it is output.
      else if (!midToken && (name === "T_OPEN_TAG" || name === "T_OPEN_TAG_WITH_ECHO")) line.verbatim = true;
      // Inside a multi-line comment, lines keep their alignment (` * ` in docblocks).
      else if (midToken && (name === "T_COMMENT" || name === "T_DOC_COMMENT")) line.anchor = tokenLine;
      else if (name === "T_WHITESPACE") pendingLine = nextLine;
      else if (!midToken) line.anchor = anchorHere();
      if (!midToken) tokenLine = nextLine;
      nextLine++;
    }

    if (NON_CODE_TOKENS.has(name) || tokenLine < 0) return;
    if (TAG_TOKENS.has(name)) {
      terminated = true;
      return;
    }

    const close = () => {
      frames.pop();
      if (started.has(tokenLine)) layout[tokenLine].blocks.push(-1);
      else layout[tokenLine].leadingCloses++;
    };
    const open = (frame: Omit<PhpFrame, "line" | "statementStart">) => {
      frames.push({ ...frame, line: tokenLine, statementStart: -1 });
      if (frame.kind !== "bracket") layout[tokenLine].blocks.push(1);
    };
    const closeCases = () => {
      while (top().kind === "case") close();
    };

    if (name === '"' || name === "`" || name === "T_START_HEREDOC" || name === "T_END_HEREDOC") {
      inString = name === "T_START_HEREDOC" ? true : name === "T_END_HEREDOC" ? false : !inString;
    }
    // Interpolation braces (`{$a}`, `${a}`) are part of the string.
    if (inString && name !== "T_START_HEREDOC" && name !== '"' && name !== "`") return;

    if (terminated && top().kind !== "bracket") top().statementStart = tokenLine;
    const condition = expectCondition;
    expectCondition = null;
    terminated = false;

    if (name === "(" || name === "[") {
      open({ kind: "bracket", condition: name === "(" ? (condition ?? undefined) : undefined });
    } else if (name === ")" || name === "]") {
      const frame = top();
      if (frame.kind === "bracket") {
        frames.pop();
        if (frame.condition) conditionEnd = { codeIndex, keyword: frame.condition };
      }
    } else if (name === "{") {
      const afterSwitch = conditionEnd?.codeIndex === codeIndex - 1 && conditionEnd.keyword === "T_SWITCH";
      open({ kind: "brace", switchBody: afterSwitch });
      terminated = true;
    } else if (name === "}") {
      closeCases();
      if (frames.length > 1 && top().kind === "brace") close();
      terminated = true;
    } else if (name === ";" || name === ":") {
      if (pendingCase === frames.length) {
        open({ kind: "case" });
        pendingCase = null;
      } else if (
        name === ":" &&
        (previousCode === "T_ELSE" || conditionEnd?.codeIndex === codeIndex - 1)
      ) {
        const keyword = previousCode === "T_ELSE" ? "T_ELSE" : (conditionEnd?.keyword ?? "");
        open({ kind: "alt", switchBody: keyword === "T_SWITCH" });
      } else if (name === ":") {
        // A ternary or a label: the statement goes on.
        previousCode = name;
        codeIndex++;
        started.add(tokenLine);
        return;
      }
      terminated = true;
    } else if (name === "," && top().kind !== "bracket") {
      terminated = true;
    } else if (name === "T_CASE" || name === "T_DEFAULT") {
      if (top().kind === "case") close();
      if (top().switchBody) pendingCase = frames.length;
    } else if (ALT_END_KEYWORDS.has(name)) {
      closeCases();
      if (top().kind === "alt") close();
    } else if ((name === "T_ELSE" || name === "T_ELSEIF") && top().kind === "alt" && isAltBranch(tokens, index)) {
      close();
    }

    if (CONDITION_KEYWORDS.has(name)) expectCondition = name;
    previousCode = name;
    codeIndex++;
    started.add(tokenLine);
  });

  return layout;
}

export function validatePhp(input: string): Result<void, string> {
  const result = parsePhp(input);
  if (result.ok) {
    return { ok: true, value: undefined };
  }
  return { ok: false, error: result.error };
}
