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
});
