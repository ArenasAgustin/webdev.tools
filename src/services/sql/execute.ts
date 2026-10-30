/**
 * SQL execution over a sql.js database, with bounded memory.
 * Runs inside the SQL worker; kept here so it can be tested without one.
 */

import type { Database, Statement } from "sql.js";
import type { SqlResultSet } from "@/types/sql";
import { CELL_CAP } from "@/services/sql/worker.types";
import { serviceMessage } from "@/services/serviceMessage";

type Cell = SqlResultSet["rows"][number][number];
/** A value as sql.js reads it, before toCell turns it into a Cell. */
type RawValue = Cell | Uint8Array;

export interface StatementsResult {
  /** One entry per statement that produced rows, in execution order. */
  resultSets: SqlResultSet[];
  /** True when any result set was cut by the row cap. */
  truncated: boolean;
  /** Present (true) when any long text or BLOB value was cut to the cell cap. */
  valuesTruncated?: true;
}

/**
 * A statement of the script failed. `partial` holds the result sets of the
 * statements that ran before it, so they can be shown next to the error.
 */
export class SqlStatementError extends Error {
  readonly partial: StatementsResult;

  constructor(message: string, partial: StatementsResult, options?: ErrorOptions) {
    super(message, options);
    this.name = "SqlStatementError";
    this.partial = partial;
  }
}

// sql.js reads integers as bigint with this option; @types/sql.js does not declare it.
interface BigIntStatement {
  get(params: null, config: { useBigInt: true }): (RawValue | bigint)[];
}

/**
 * Read the current row with integers as bigint, so values beyond 2^53 are not
 * rounded. Safe integers become numbers; larger ones become their exact decimal
 * string, which JSON (and any reader of the downloaded JSON) keeps as written
 * instead of silently rounding it as a number.
 */
function readRow(stmt: Statement): RawValue[] {
  return (stmt as unknown as BigIntStatement).get(null, { useBigInt: true }).map((value) => {
    if (typeof value !== "bigint") return value;
    return value >= BigInt(Number.MIN_SAFE_INTEGER) && value <= BigInt(Number.MAX_SAFE_INTEGER)
      ? Number(value)
      : value.toString();
  });
}

/** Render a BLOB as a SQLite hex literal (x'0102FF'), readable in the view and the JSON download. */
function blobToHex(bytes: Uint8Array): string {
  let hex = "";
  for (const byte of bytes) hex += byte.toString(16).padStart(2, "0");
  return `x'${hex.toUpperCase()}'`;
}

/**
 * Prepare one value for the result: a BLOB becomes its hex literal, and a text
 * value is cut to `cellCap` characters (a BLOB to half as many bytes, so its hex
 * stays within the cap), marked with a trailing "…", so one huge value
 * (randomblob(1e6), a 50 MB string) cannot make the output unusable.
 */
function toCell(value: RawValue, cellCap: number): { cell: Cell; cut: boolean } {
  if (typeof value === "string" && value.length > cellCap) {
    return { cell: `${value.slice(0, cellCap)}…`, cut: true };
  }
  if (value instanceof Uint8Array) {
    const maxBytes = Math.floor(cellCap / 2);
    const cut = value.length > maxBytes;
    const hex = blobToHex(cut ? value.subarray(0, maxBytes) : value);
    return { cell: cut ? `${hex}…` : hex, cut };
  }
  return { cell: value, cut: false };
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
 * by `cellCap` (see toCell).
 *
 * A failing statement throws a `services.sql.statementError` message naming its
 * statement number, so the user can tell which part of the script broke, as a
 * SqlStatementError carrying the result sets read before it.
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

  // The statement being read, until the iterator advances (and frees it). The
  // iterator has no return(), so a statement whose step() throws is freed here.
  let current: Statement | null = null;
  try {
    for (const stmt of db.iterateStatements(sql)) {
      current = stmt;
      statement++;
      readStatement(stmt);
      current = null;
    }
  } catch (err) {
    current?.free();
    // Without a current statement, the next one failed to prepare.
    throw new SqlStatementError(
      serviceMessage("services.sql.statementError", {
        statement: current ? statement : statement + 1,
        message: err instanceof Error ? err.message : String(err),
      }),
      collect(),
      { cause: err },
    );
  }

  return collect();

  function collect(): StatementsResult {
    const result: StatementsResult = { resultSets, truncated: resultSets.some((set) => set.truncated) };
    if (resultSets.some((set) => set.valuesTruncated)) result.valuesTruncated = true;
    return result;
  }

  function readStatement(stmt: Statement): void {
    if (!stmt.step()) {
      return;
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
      rows.push(
        readRow(stmt).map((value) => {
          const { cell, cut } = toCell(value, cellCap);
          if (cut) valuesTruncated = true;
          return cell;
        }),
      );
      remaining--;
    } while (stmt.step());
    resultSets.push(
      valuesTruncated
        ? { statement, columns, rows, truncated, valuesTruncated: true }
        : { statement, columns, rows, truncated },
    );
  }
}
