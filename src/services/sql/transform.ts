/**
 * SQL Transform — pure, sync functions using sql-formatter.
 * No sql.js dependency here; all functions run on the main thread.
 */

import { format as sqlFormat } from "sql-formatter";
import type { Result } from "@/types/common";
import type { SqlFormatConfig } from "@/types/sql";
import { DEFAULT_SQL_FORMAT_CONFIG } from "@/types/sql";
import { serviceMessage } from "@/services/serviceMessage";

/**
 * Format SQL using sql-formatter.
 * Returns Result<string, string> — ok: false if the formatter throws.
 * Empty input is a no-op (returns empty string as ok).
 */
export function formatSql(input: string, config: SqlFormatConfig): Result<string, string> {
  if (!input.trim()) {
    return { ok: true, value: "" };
  }

  try {
    const indent = config.tabWidth ?? 2;
    const useTabs = indent === "\t";
    const value = sqlFormat(input, {
      language: config.dialect,
      useTabs,
      tabWidth: useTabs ? 2 : indent,
    });
    return { ok: true, value };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Validate SQL by attempting to format it.
 * Returns Result<void, string> — ok: false with the parse error message.
 * Empty input is considered invalid.
 */
export function validateSql(input: string): Result<void, string> {
  if (!input.trim()) {
    return { ok: false, error: serviceMessage("services.sql.empty") };
  }

  const result = formatSql(input, DEFAULT_SQL_FORMAT_CONFIG);
  if (result.ok) {
    return { ok: true, value: undefined };
  }
  return { ok: false, error: result.error };
}

interface SqlSegment {
  kind: "literal" | "comment" | "code";
  text: string;
}

const QUOTE_CHARS = new Set(["'", '"', "`"]);

// Splits SQL into quoted literals/identifiers, comments and plain code, so
// minification never treats `--` or `/*` inside a string as a comment.
function tokenizeSql(source: string): SqlSegment[] {
  const segments: SqlSegment[] = [];
  let code = "";
  let i = 0;

  const push = (kind: SqlSegment["kind"], end: number) => {
    if (code) {
      segments.push({ kind: "code", text: code });
      code = "";
    }
    segments.push({ kind, text: source.slice(i, end) });
    i = end;
  };

  while (i < source.length) {
    const char = source[i];

    if (QUOTE_CHARS.has(char)) {
      let j = i + 1;
      // SQLite has no backslash escapes: `'C:\'` is a complete literal.
      while (j < source.length) {
        if (source[j] === char) {
          // A doubled quote is an escaped quote inside the literal.
          if (source[j + 1] === char) j += 2;
          else break;
        } else {
          j += 1;
        }
      }
      push("literal", Math.min(j + 1, source.length));
      continue;
    }

    if (char === "-" && source[i + 1] === "-") {
      const newline = source.indexOf("\n", i);
      push("comment", newline === -1 ? source.length : newline);
      continue;
    }

    if (char === "/" && source[i + 1] === "*") {
      const close = source.indexOf("*/", i + 2);
      push("comment", close === -1 ? source.length : close + 2);
      continue;
    }

    code += char;
    i += 1;
  }

  if (code) segments.push({ kind: "code", text: code });
  return segments;
}

/**
 * Minify SQL — strips `--` line comments and `/* *\/` block comments outside
 * quoted literals, then collapses whitespace runs in code to a single space.
 * Pure, idempotent. Empty input is a no-op.
 */
export function minifySql(input: string): Result<string, string> {
  if (!input.trim()) {
    return { ok: true, value: "" };
  }

  try {
    let result = "";
    const appendSpace = () => {
      if (result && !result.endsWith(" ")) result += " ";
    };

    for (const segment of tokenizeSql(input)) {
      if (segment.kind === "literal") {
        result += segment.text;
      } else if (segment.kind === "comment") {
        appendSpace();
      } else {
        // Collapse whitespace runs in code only; a leading space merges with any
        // space already emitted by a preceding comment.
        const collapsed = segment.text.replace(/\s+/g, " ");
        if (collapsed.startsWith(" ")) {
          appendSpace();
          result += collapsed.slice(1);
        } else {
          result += collapsed;
        }
      }
    }

    return { ok: true, value: result.trim() };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
