import { describe, it, expect, beforeAll } from "vitest";
import initSqlJs, { type Database } from "sql.js";
import { runStatements } from "@/services/sql/execute";

describe("runStatements", () => {
  let db: Database;

  beforeAll(async () => {
    const SQL = await initSqlJs();
    db = new SQL.Database();
  });

  it("returns the last result set of a multi-statement script", () => {
    const result = runStatements(
      db,
      "CREATE TABLE t(a); INSERT INTO t VALUES (1), (2);; SELECT 'x' AS s; SELECT a FROM t ORDER BY a;",
      10,
    );

    expect(result).toEqual({ columns: ["a"], rows: [[1], [2]], truncated: false });
  });

  it("ignores statements that produce no rows", () => {
    const result = runStatements(db, "SELECT 1 AS n; CREATE TABLE empty(a); SELECT a FROM empty;", 10);

    expect(result).toEqual({ columns: ["n"], rows: [[1]], truncated: false });
  });

  it("stops reading rows past the cap, so an unbounded query still returns", () => {
    const result = runStatements(
      db,
      "WITH RECURSIVE c(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM c) SELECT x FROM c;",
      3,
    );

    expect(result).toEqual({ columns: ["x"], rows: [[1], [2], [3]], truncated: true });
  });

  it("does not flag truncation when the row count equals the cap", () => {
    const result = runStatements(db, "SELECT 1 UNION ALL SELECT 2;", 2);

    expect(result.truncated).toBe(false);
    expect(result.rows).toHaveLength(2);
  });

  it("propagates SQL errors", () => {
    expect(() => runStatements(db, "SELECT * FROM missing_table;", 10)).toThrow(/no such table/);
  });
});
