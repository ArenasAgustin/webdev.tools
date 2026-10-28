import { describe, it, expect, vi } from "vitest";
import { sqlPlaygroundConfig } from "./sql.config";

describe("sqlPlaygroundConfig", () => {
  it("has correct id", () => {
    expect(sqlPlaygroundConfig.id).toBe("sql");
  });

  it("has a label/name", () => {
    expect(typeof sqlPlaygroundConfig.name === "string" || typeof sqlPlaygroundConfig.name === "object").toBe(true);
    const name = typeof sqlPlaygroundConfig.name === "string" ? sqlPlaygroundConfig.name : Object.values(sqlPlaygroundConfig.name)[0];
    expect(name?.length).toBeGreaterThan(0);
  });

  it("has sql as language", () => {
    expect(sqlPlaygroundConfig.language).toBe("sql");
  });

  it("has an icon", () => {
    expect(sqlPlaygroundConfig.icon).toBeDefined();
    expect(sqlPlaygroundConfig.icon.length).toBeGreaterThan(0);
  });

  it("has a description", () => {
    expect(sqlPlaygroundConfig.description).toBeDefined();
  });

  it("has example SQL with SELECT statement", () => {
    expect(sqlPlaygroundConfig.example).toContain("SELECT");
  });

  it("has keywords for SEO", () => {
    expect(sqlPlaygroundConfig.keywords).toBeDefined();
    expect(Array.isArray(sqlPlaygroundConfig.keywords)).toBe(true);
    expect(sqlPlaygroundConfig.keywords!.length).toBeGreaterThan(0);
  });

  it("has SQL-related keywords", () => {
    const keywords = sqlPlaygroundConfig.keywords ?? [];
    const hasSqlKeyword = keywords.some((k) => k.toLowerCase().includes("sql"));
    expect(hasSqlKeyword).toBe(true);
  });
});

vi.mock("@/services/sql/worker", () => ({
  formatSqlAsync: vi.fn(() => Promise.resolve({ ok: true, value: "SELECT 1;" })),
  minifySqlAsync: vi.fn(() => Promise.resolve({ ok: true, value: "SELECT 1" })),
  executeSqlAsync: vi.fn(),
  resetSqlAsync: vi.fn(),
}));

describe("SQL file settings", () => {
  it("are the single source for the engine and actions file config", async () => {
    const { sqlFileSettings } = await import("./sql.config");
    const { sqlEngine } = await import("../engines/sql.engine");

    expect(sqlEngine.fileConfig).toMatchObject(sqlFileSettings);
  });

  it("engine runners return the transformed SQL, not the worker result object", async () => {
    const { sqlEngine } = await import("../engines/sql.engine");

    await expect(sqlEngine.fileConfig.formatRunner("select 1", { dialect: "sql", tabWidth: 2 })).resolves.toBe("SELECT 1;");
    await expect(sqlEngine.fileConfig.minifyRunner("select 1")).resolves.toBe("SELECT 1");
  });
});
