/**
 * SQL Transform — pure, sync functions using sql-formatter.
 * No sql.js dependency here; all functions run on the main thread.
 */

import { format as sqlFormat } from "sql-formatter";
import type { Result } from "@/types/common";
import type { SqlFormatConfig } from "@/types/sql";
import { DEFAULT_SQL_FORMAT_CONFIG } from "@/types/sql";

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
    const value = sqlFormat(input, {
      language: config.dialect,
      tabWidth: config.tabWidth ?? 2,
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
    return { ok: false, error: "El SQL está vacío" };
  }

  const result = formatSql(input, DEFAULT_SQL_FORMAT_CONFIG);
  if (result.ok) {
    return { ok: true, value: undefined };
  }
  return { ok: false, error: result.error };
}

/**
 * Minify SQL — strips `--` line comments and `/* *\/` block comments,
 * then collapses all whitespace sequences (including newlines) to a single space.
 * Pure, idempotent. Empty input is a no-op.
 */
export function minifySql(input: string): Result<string, string> {
  if (!input.trim()) {
    return { ok: true, value: "" };
  }

  try {
    // 1. Remove block comments /* ... */
    let result = input.replace(/\/\*[\s\S]*?\*\//g, " ");
    // 2. Remove line comments -- ...
    result = result.replace(/--[^\n]*/g, " ");
    // 3. Collapse all whitespace (tabs, newlines, multiple spaces) to a single space
    result = result.replace(/\s+/g, " ").trim();
    return { ok: true, value: result };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
