import { describe, it, expect, beforeAll, vi } from "vitest";
import initSqlJs, { type Database, type Statement } from "sql.js";
import { roundElapsedMs, runStatements, SqlStatementError } from "@/services/sql/execute";
import { localizeServiceMessage } from "@/services/localizeServiceMessage";

describe("runStatements", () => {
  let db: Database;

  beforeAll(async () => {
    const SQL = await initSqlJs();
    db = new SQL.Database();
  });

  it("returns every result set of a multi-statement script, labelled by statement", () => {
    const result = runStatements(
      db,
      "CREATE TABLE t(a); INSERT INTO t VALUES (1), (2);; SELECT 'x' AS s; SELECT a FROM t ORDER BY a;",
      10,
    );

    expect(result).toEqual({
      resultSets: [
        { statement: 3, columns: ["s"], rows: [["x"]], truncated: false },
        { statement: 4, columns: ["a"], rows: [[1], [2]], truncated: false },
      ],
      truncated: false,
    });
  });

  it("ignores statements that produce no rows", () => {
    const result = runStatements(db, "SELECT 1 AS n; CREATE TABLE empty(a); SELECT a FROM empty;", 10);

    expect(result).toEqual({
      resultSets: [{ statement: 1, columns: ["n"], rows: [[1]], truncated: false }],
      truncated: false,
    });
  });

  it("stops reading rows past the cap, so an unbounded query still returns", () => {
    const result = runStatements(
      db,
      "WITH RECURSIVE c(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM c) SELECT x FROM c;",
      3,
    );

    expect(result).toEqual({
      resultSets: [{ statement: 1, columns: ["x"], rows: [[1], [2], [3]], truncated: true }],
      truncated: true,
    });
  });

  it("shares the row cap across result sets but still runs later statements", () => {
    const result = runStatements(
      db,
      "CREATE TABLE cap(a); SELECT 1 UNION ALL SELECT 2; SELECT 3 UNION ALL SELECT 4; INSERT INTO cap VALUES (9) RETURNING a;",
      3,
    );

    expect(result.truncated).toBe(true);
    expect(result.resultSets.map((set) => [set.statement, set.rows, set.truncated])).toEqual([
      [2, [[1], [2]], false],
      [3, [[3]], true],
      [4, [], true],
    ]);
    // the statement past the cap still ran
    expect(db.exec("SELECT a FROM cap")[0].values).toEqual([[9]]);
  });

  it("does not flag truncation when the row count equals the cap", () => {
    const result = runStatements(db, "SELECT 1 UNION ALL SELECT 2;", 2);

    expect(result.truncated).toBe(false);
    expect(result.resultSets[0].rows).toHaveLength(2);
  });

  it("cuts long text and blob values so a huge cell cannot flood the output", () => {
    const result = runStatements(db, "SELECT 'abc' AS short, zeroblob(4) AS b, printf('%.50000c', 'x') AS long, zeroblob(50000) AS blob;", 10, 100);

    const [short, b, long, blob] = result.resultSets[0].rows[0] as string[];
    expect(short).toBe("abc");
    expect(b).toBe("x'00000000'");
    expect(long).toBe(`${"x".repeat(100)}…`);
    expect(blob).toBe(`x'${"00".repeat(50)}'…`);
    expect(result.valuesTruncated).toBe(true);
    expect(result.resultSets[0].valuesTruncated).toBe(true);
  });

  it("does not flag value truncation for values within the cap", () => {
    const result = runStatements(db, "SELECT printf('%.100c', 'x') AS s;", 10, 100);

    expect(result.resultSets[0].rows[0][0]).toHaveLength(100);
    expect(result.valuesTruncated).toBeUndefined();
  });

  it("renders BLOBs as SQLite hex literals", () => {
    const result = runStatements(db, "SELECT x'0102FF' AS b, zeroblob(0) AS empty;", 10);

    expect(result.resultSets[0].rows[0]).toEqual(["x'0102FF'", "x''"]);
  });

  it("keeps integers beyond 2^53 exact, as decimal strings", () => {
    const result = runStatements(
      db,
      "SELECT 9007199254740993 AS big, 9223372036854775807 AS max, -9223372036854775808 AS min, 9007199254740991 AS safe, 1.5 AS real;",
      10,
    );

    expect(result.resultSets[0].rows[0]).toEqual([
      "9007199254740993",
      "9223372036854775807",
      "-9223372036854775808",
      9007199254740991,
      1.5,
    ]);
  });

  it("propagates SQL errors", () => {
    expect(() => runStatements(db, "SELECT * FROM missing_table;", 10)).toThrow(/no such table/);
  });

  function errorMessage(run: () => unknown): string {
    try {
      run();
    } catch (err) {
      return localizeServiceMessage(err instanceof Error ? err.message : String(err));
    }
    throw new Error("expected an error");
  }

  it("names the statement that failed to prepare", () => {
    expect(errorMessage(() => runStatements(db, "SELECT 1; SELECT * FROM missing_table;", 10))).toBe(
      "Sentencia 2: no such table: missing_table",
    );
  });

  it("frees the statement whose step throws (the iterator has no return())", () => {
    const yielded: Statement[] = [];
    const iterate = db.iterateStatements.bind(db);
    const spy = vi.spyOn(db, "iterateStatements").mockImplementation((sql: string) => {
      const iterator = iterate(sql);
      return {
        [Symbol.iterator]() {
          return this;
        },
        next() {
          const step = iterator.next();
          if (!step.done) yielded.push(step.value);
          return step;
        },
        getRemainingSQL: () => iterator.getRemainingSQL(),
      };
    });
    try {
      expect(() => runStatements(db, "SELECT abs(-9223372036854775808);", 10)).toThrow();
    } finally {
      spy.mockRestore();
    }

    expect(yielded).toHaveLength(1);
    // A freed statement refuses to run again.
    expect(() => yielded[0].step()).toThrow(/Statement closed/);
  });

  it("names the statement that failed while running", () => {
    expect(
      errorMessage(() => runStatements(db, "SELECT 1; SELECT 2; SELECT abs(-9223372036854775808);", 10)),
    ).toBe("Sentencia 3: integer overflow");
  });

  it("keeps the result sets of the statements that ran before the failure", () => {
    let caught: unknown;
    try {
      runStatements(db, "SELECT 1 AS a; SELECT 'b' AS b; SELECT * FROM missing_table;", 10);
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(SqlStatementError);
    expect((caught as SqlStatementError).partial).toEqual({
      resultSets: [
        { statement: 1, columns: ["a"], rows: [[1]], truncated: false },
        { statement: 2, columns: ["b"], rows: [["b"]], truncated: false },
      ],
      truncated: false,
    });
  });
});

describe("roundElapsedMs", () => {
  it("keeps one decimal so timings read cleanly", () => {
    expect(roundElapsedMs(3.2999999999999545)).toBe(3.3);
    expect(roundElapsedMs(0.04)).toBe(0);
    expect(roundElapsedMs(12)).toBe(12);
  });
});
