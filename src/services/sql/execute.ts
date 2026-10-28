/**
 * SQL execution over a sql.js database, with bounded memory.
 * Runs inside the SQL worker; kept here so it can be tested without one.
 */

import type { Database, SqlValue } from "sql.js";

export interface StatementsResult {
  columns: string[];
  rows: SqlValue[][];
  /** True when the last result set had more rows than the cap. */
  truncated: boolean;
}

/** Round a performance.now() delta to one decimal, so the result shows 3.3 instead of 3.2999999999999545. */
export function roundElapsedMs(ms: number): number {
  return Math.round(ms * 10) / 10;
}

/**
 * Run every statement in `sql` and return the last result set that produced
 * rows, like `Database.exec`. Unlike `exec`, rows are read one at a time and
 * reading stops at `rowCap + 1`, so a huge (or unbounded) result never has to
 * fit in memory. Stopping early is safe: SELECTs have no side effects, and
 * SQLite applies every change of a `RETURNING` statement on its first step.
 */
export function runStatements(db: Database, sql: string, rowCap: number): StatementsResult {
  let last: StatementsResult = { columns: [], rows: [], truncated: false };

  // The iterator frees each statement when it advances to the next one.
  for (const stmt of db.iterateStatements(sql)) {
    if (!stmt.step()) {
      continue;
    }
    const columns = stmt.getColumnNames();
    const rows: SqlValue[][] = [];
    let truncated = false;
    do {
      if (rows.length === rowCap) {
        truncated = true;
        break;
      }
      rows.push(stmt.get());
    } while (stmt.step());
    last = { columns, rows, truncated };
  }

  return last;
}
