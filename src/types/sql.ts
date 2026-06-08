/**
 * SQL Playground types
 */

// v1: only default dialect.
// v2 will widen to: "postgresql" | "mysql" | "sqlite" | "mariadb" | "transactsql" | ...
export type SqlDialect = "sql";

export interface SqlFormatConfig {
  dialect: SqlDialect;
  tabWidth?: number; // default: 2
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

export interface SqlExecuteResult {
  columns: string[];
  rows: unknown[][];
  elapsedMs: number;
  /** true when the row cap (1000) was hit and results were truncated */
  truncated: boolean;
}
