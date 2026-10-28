// @vitest-environment node
import { describe, it, expect } from "vitest";
import { formatSql, validateSql, minifySql } from "@/services/sql/transform";
import type { SqlFormatConfig } from "@/types/sql";

const DEFAULT_CONFIG: SqlFormatConfig = { dialect: "sql", tabWidth: 2 };

describe("formatSql", () => {
  it("formats valid SQL — happy path", () => {
    const input = "SELECT id,name FROM users WHERE id=1";
    const result = formatSql(input, DEFAULT_CONFIG);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("SELECT");
      expect(result.value).toContain("id,");
      // formatted output has newlines
      expect(result.value).toContain("\n");
    }
  });

  it("returns empty string for empty input (no-op)", () => {
    const result = formatSql("   ", DEFAULT_CONFIG);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("");
    }
  });

  it("returns error for parse-invalid SQL", () => {
    // Single-quoted unclosed string forces a parse error in sql-formatter
    const result = formatSql("SELECT 'unclosed string", DEFAULT_CONFIG);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeTypeOf("string");
      expect(result.error.length).toBeGreaterThan(0);
    }
  });

  it("is idempotent — formatting twice produces the same output", () => {
    const input = "SELECT id,name FROM users WHERE id=1";
    const first = formatSql(input, DEFAULT_CONFIG);
    expect(first.ok).toBe(true);

    if (first.ok) {
      const second = formatSql(first.value, DEFAULT_CONFIG);
      expect(second.ok).toBe(true);
      if (second.ok) {
        expect(second.value).toBe(first.value);
      }
    }
  });

  it("respects tabWidth option", () => {
    const input = "SELECT id FROM users";
    const result = formatSql(input, { dialect: "sql", tabWidth: 4 });

    expect(result.ok).toBe(true);
  });

  it("indents with tabs when the indent option is a tab", () => {
    const tab = "\t";
    const result = formatSql("select a, b from t where x = 1", { dialect: "sql", tabWidth: tab });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.split("\n")).toContain(`${tab}a,`);
      expect(result.value.split("\n")).toContain(`${tab}t`);
    }
  });
});

describe("validateSql", () => {
  it("returns ok: true for valid SQL", () => {
    const result = validateSql("SELECT 1");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeUndefined();
    }
  });

  it("returns ok: false for empty input", () => {
    const result = validateSql("   ");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeTypeOf("string");
    }
  });

  it.each(["SELECT [col] FROM t", "SELECT $x", "SELECT :name, ?1", "SELECT @v"])(
    "accepts the SQLite syntax %s",
    (sql) => {
      expect(validateSql(sql).ok).toBe(true);
    },
  );

  it("formats SQLite bracket identifiers and parameters", () => {
    expect(formatSql("SELECT [a b] FROM t WHERE x = $v", { dialect: "sql", tabWidth: 2 })).toEqual({
      ok: true,
      value: "SELECT\n  [a b]\nFROM\n  t\nWHERE\n  x = $v",
    });
  });

  it("returns ok: false for parse-invalid SQL", () => {
    const result = validateSql("SELECT 'unclosed");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.length).toBeGreaterThan(0);
    }
  });
});

describe("minifySql", () => {
  it("minifies multi-line SQL — happy path", () => {
    const input = "SELECT\n  id,\n  name\nFROM\n  users\nWHERE\n  id = 1";
    const result = minifySql(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).not.toContain("\n");
      expect(result.value).toBe("SELECT id, name FROM users WHERE id = 1");
    }
  });

  it("strips -- line comments", () => {
    const input = "-- Get users\nSELECT id FROM users";
    const result = minifySql(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).not.toContain("--");
      expect(result.value).not.toContain("Get users");
    }
  });

  it("strips /* */ block comments", () => {
    const input = "/* block comment */ SELECT id FROM users";
    const result = minifySql(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).not.toContain("/*");
      expect(result.value).not.toContain("*/");
      expect(result.value).not.toContain("block comment");
    }
  });

  it("strips both comment types in mixed input", () => {
    const input = `-- line comment
/* block comment */
SELECT id, name FROM users WHERE id = 1`;
    const result = minifySql(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).not.toContain("--");
      expect(result.value).not.toContain("/*");
      expect(result.value).toContain("SELECT");
    }
  });

  it("returns empty string for empty input (no-op)", () => {
    const result = minifySql("   ");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("");
    }
  });

  it("is idempotent — minifying twice produces the same output", () => {
    const input = "SELECT id,\n  name\nFROM users";
    const first = minifySql(input);
    expect(first.ok).toBe(true);

    if (first.ok) {
      const second = minifySql(first.value);
      expect(second.ok).toBe(true);
      if (second.ok) {
        expect(second.value).toBe(first.value);
      }
    }
  });

  it("round-trip safe — format(minify(format(x))) equals format(x)", () => {
    const input = "SELECT id,name FROM users WHERE id=1";
    const formatted = formatSql(input, DEFAULT_CONFIG);
    expect(formatted.ok).toBe(true);

    if (formatted.ok) {
      const minified = minifySql(formatted.value);
      expect(minified.ok).toBe(true);

      if (minified.ok) {
        const reformatted = formatSql(minified.value, DEFAULT_CONFIG);
        expect(reformatted.ok).toBe(true);

        if (reformatted.ok) {
          expect(reformatted.value).toBe(formatted.value);
        }
      }
    }
  });

  it("keeps comment markers and spacing inside string literals", () => {
    const result = minifySql(
      "SELECT '--x' AS a,\n  'a   b' AS b, 'x;y' AS c, \"col  name\" FROM t; -- trailing",
    );
    expect(result).toEqual({
      ok: true,
      value: "SELECT '--x' AS a, 'a   b' AS b, 'x;y' AS c, \"col  name\" FROM t;",
    });
  });

  it("keeps block-comment text inside strings and escaped quotes", () => {
    const result = minifySql("SELECT '/* not */' AS x, 'it''s  ok' /* drop */ AS y;");
    expect(result).toEqual({ ok: true, value: "SELECT '/* not */' AS x, 'it''s  ok' AS y;" });
  });

  it("keeps backtick-quoted identifiers verbatim", () => {
    const result = minifySql("SELECT `a  --b`\n FROM t;");
    expect(result).toEqual({ ok: true, value: "SELECT `a  --b` FROM t;" });
  });

  it("keeps [bracket] identifiers verbatim", () => {
    const result = minifySql("SELECT [a--b], [x  /* y]\nFROM (SELECT 1 AS [a--b], 2 AS [x  /* y])\nWHERE 1;");
    expect(result).toEqual({
      ok: true,
      value: "SELECT [a--b], [x  /* y] FROM (SELECT 1 AS [a--b], 2 AS [x  /* y]) WHERE 1;",
    });
  });

  it("treats a backslash as a plain character in literals, like SQLite", () => {
    const result = minifySql("SELECT 'C:\\'; -- it's\nSELECT 2 AS two;");
    expect(result).toEqual({ ok: true, value: "SELECT 'C:\\'; SELECT 2 AS two;" });
  });
});
