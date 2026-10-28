/**
 * SQL Playground types
 */

import type { IndentStyle } from "@/types/format";

// v1: only default dialect.
// v2 will widen to: "postgresql" | "mysql" | "sqlite" | "mariadb" | "transactsql" | ...
export type SqlDialect = "sql";

export interface SqlFormatConfig {
  dialect: SqlDialect;
  tabWidth?: IndentStyle; // default: 2; "\t" indents with tabs
  autoCopy?: boolean;
}

export interface SqlMinifyConfig {
  autoCopy?: boolean;
}

export interface SqlToolsConfig {
  format: SqlFormatConfig;
  minify: SqlMinifyConfig;
}

export const DEFAULT_SQL_FORMAT_CONFIG: SqlFormatConfig = {
  dialect: "sql",
  tabWidth: 2,
};

export const DEFAULT_SQL_TOOLS_CONFIG: SqlToolsConfig = {
  format: DEFAULT_SQL_FORMAT_CONFIG,
  minify: { autoCopy: false },
};

/** Rows produced by one statement of an executed script. */
export interface SqlResultSet {
  /** 1-based position of the statement in the script */
  statement: number;
  columns: string[];
  rows: (number | string | Uint8Array | null)[][];
  /** true when the row cap stopped reading this result set */
  truncated: boolean;
  /** present (true) when a long text or BLOB value of this result set was cut */
  valuesTruncated?: true;
}

export interface SqlExecuteResult {
  /** Every statement that produced rows, in order (a multi-statement script yields several) */
  resultSets: SqlResultSet[];
  elapsedMs: number;
  /** true when the row cap (1000, shared by all result sets) was hit and results were truncated */
  truncated: boolean;
  /** present (true) when any long text or BLOB value was cut to the cell cap */
  valuesTruncated?: true;
}
