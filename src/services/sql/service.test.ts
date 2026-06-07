import { describe, it, expect } from "vitest";
import { sqlService } from "@/services/sql/service";

describe("sqlService", () => {
  it("has a format function", () => {
    expect(typeof sqlService.format).toBe("function");
  });

  it("has a minify function", () => {
    expect(typeof sqlService.minify).toBe("function");
  });

  it("has a validate function", () => {
    expect(typeof sqlService.validate).toBe("function");
  });

  describe("format", () => {
    it("returns ok: true for valid SQL", async () => {
      const result = await sqlService.format("SELECT id FROM users", { dialect: "sql", tabWidth: 2 });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain("SELECT");
      }
    });

    it("returns ok: false for parse-invalid SQL", async () => {
      const result = await sqlService.format("SELECT 'unclosed", { dialect: "sql", tabWidth: 2 });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeTypeOf("string");
        expect(result.error.length).toBeGreaterThan(0);
      }
    });

    it("returns empty string for empty input", async () => {
      const result = await sqlService.format("   ");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("");
      }
    });
  });

  describe("minify", () => {
    it("returns ok: true and minified SQL", async () => {
      const input = "SELECT\n  id,\n  name\nFROM\n  users";
      const result = await sqlService.minify(input);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).not.toContain("\n");
      }
    });

    it("returns empty string for empty input", async () => {
      const result = await sqlService.minify("   ");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("");
      }
    });
  });

  describe("validate", () => {
    it("returns ok: true for valid SQL", async () => {
      const result = await sqlService.validate("SELECT 1");

      expect(result.ok).toBe(true);
    });

    it("returns ok: false for empty input", async () => {
      const result = await sqlService.validate("   ");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeTypeOf("string");
      }
    });

    it("returns ok: false for parse-invalid SQL", async () => {
      const result = await sqlService.validate("SELECT 'unclosed");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.length).toBeGreaterThan(0);
      }
    });
  });
});
