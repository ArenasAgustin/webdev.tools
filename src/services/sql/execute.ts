/**
 * SQL execution over a sql.js database, with bounded memory.
 * Runs inside the SQL worker; kept here so it can be tested without one.
 */

import type { Database } from "sql.js";
import type { SqlResultSet } from "@/types/sql";

export interface StatementsResult {
  /** One entry per statement that produced rows, in execution order. */
  resultSets: SqlResultSet[];
  /** True when any result set was cut by the row cap. */
  truncated: boolean;
}

/** Round a performance.now() delta to one decimal, so the result shows 3.3 instead of 3.2999999999999545. */
export function roundElapsedMs(ms: number): number {
  return Math.round(ms * 10) / 10;
}

/**
 * Run every statement in `sql` and return each result set that produced rows,
 * labelled with its 1-based statement number. Unlike `Database.exec`, rows are
 * read one at a time and `rowCap` bounds the rows kept across all result sets,
 * so a huge (or unbounded) result never has to fit in memory. Once the cap is
 * reached, later statements still run (for their side effects) but keep no rows.
 * Stopping early is safe: SELECTs have no side effects, and SQLite applies every
 * change of a `RETURNING` statement on its first step.
 */
export function runStatements(db: Database, sql: string, rowCap: number): StatementsResult {
  const resultSets: SqlResultSet[] = [];
  let remaining = rowCap;
  let statement = 0;

  // The iterator frees each statement when it advances to the next one.
  for (const stmt of db.iterateStatements(sql)) {
    statement++;
    if (!stmt.step()) {
      continue;
    }
    const columns = stmt.getColumnNames();
    const rows: SqlResultSet["rows"] = [];
    let truncated = false;
    do {
      if (remaining === 0) {
        truncated = true;
        break;
      }
      rows.push(stmt.get());
      remaining--;
    } while (stmt.step());
    resultSets.push({ statement, columns, rows, truncated });
  }

  return { resultSets, truncated: resultSets.some((set) => set.truncated) };
}
