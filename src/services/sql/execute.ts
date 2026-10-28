/**
 * SQL execution over a sql.js database, with bounded memory.
 * Runs inside the SQL worker; kept here so it can be tested without one.
 */

import type { Database, Statement } from "sql.js";
import type { SqlResultSet } from "@/types/sql";
import { CELL_CAP } from "@/services/sql/worker.types";

type Cell = SqlResultSet["rows"][number][number];

export interface StatementsResult {
  /** One entry per statement that produced rows, in execution order. */
  resultSets: SqlResultSet[];
  /** True when any result set was cut by the row cap. */
  truncated: boolean;
  /** Present (true) when any long text or BLOB value was cut to the cell cap. */
  valuesTruncated?: true;
}

// sql.js reads integers as bigint with this option; @types/sql.js does not declare it.
interface BigIntStatement {
  get(params: null, config: { useBigInt: true }): (Cell | bigint)[];
}

/**
 * Read the current row with integers as bigint, so values beyond 2^53 are not
 * rounded. Safe integers become numbers; larger ones become their exact decimal
 * string, which JSON (and any reader of the downloaded JSON) keeps as written
 * instead of silently rounding it as a number.
 */
function readRow(stmt: Statement): Cell[] {
  return (stmt as unknown as BigIntStatement).get(null, { useBigInt: true }).map((value) => {
    if (typeof value !== "bigint") return value;
    return value >= BigInt(Number.MIN_SAFE_INTEGER) && value <= BigInt(Number.MAX_SAFE_INTEGER)
      ? Number(value)
      : value.toString();
  });
}

/**
 * Cut a text value to `cellCap` characters (marked with a trailing "…") and a
 * BLOB to half as many bytes, so one huge value (randomblob(1e6), a 50 MB
 * string) cannot make the output unusable. Returns null when nothing was cut.
 */
function capCell(value: Cell, cellCap: number): Cell | null {
  if (typeof value === "string" && value.length > cellCap) {
    return `${value.slice(0, cellCap)}…`;
  }
  const maxBytes = Math.floor(cellCap / 2);
  if (value instanceof Uint8Array && value.length > maxBytes) {
    return value.slice(0, maxBytes);
  }
  return null;
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
 * change of a `RETURNING` statement on its first step. Each value is also bounded
 * by `cellCap` (see capCell).
 */
export function runStatements(
  db: Database,
  sql: string,
  rowCap: number,
  cellCap: number = CELL_CAP,
): StatementsResult {
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
    let valuesTruncated = false;
    do {
      if (remaining === 0) {
        truncated = true;
        break;
      }
      const row = readRow(stmt);
      for (let i = 0; i < row.length; i++) {
        const capped = capCell(row[i], cellCap);
        if (capped !== null) {
          row[i] = capped;
          valuesTruncated = true;
        }
      }
      rows.push(row);
      remaining--;
    } while (stmt.step());
    resultSets.push(
      valuesTruncated
        ? { statement, columns, rows, truncated, valuesTruncated: true }
        : { statement, columns, rows, truncated },
    );
  }

  const result: StatementsResult = { resultSets, truncated: resultSets.some((set) => set.truncated) };
  if (resultSets.some((set) => set.valuesTruncated)) result.valuesTruncated = true;
  return result;
}
