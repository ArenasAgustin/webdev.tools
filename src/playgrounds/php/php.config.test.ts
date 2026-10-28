import { describe, it, expect } from "vitest";
import { phpPlaygroundConfig } from "./php.config";

describe("phpPlaygroundConfig", () => {
  it("has correct id and name", () => {
    expect(phpPlaygroundConfig.id).toBe("php");
    expect(phpPlaygroundConfig.name).toBe("PHP 7.4 tools");
  });

  it("has php as language", () => {
    expect(phpPlaygroundConfig.language).toBe("php");
  });

  it("has example code that is valid PHP", () => {
    expect(phpPlaygroundConfig.example).toContain("<?php");
    expect(phpPlaygroundConfig.example).toContain("echo");
  });

  it("has keywords for SEO", () => {
    expect(phpPlaygroundConfig.keywords).toBeDefined();
    expect(phpPlaygroundConfig.keywords).toContain("PHP formatter");
  });

  it("has icon", () => {
    expect(phpPlaygroundConfig.icon).toBe("fab fa-php");
  });
});

describe("PHP file settings", () => {
  it("are the single source for the engine's file config", async () => {
    const { phpFileSettings } = await import("./php.config");
    const { phpEngine } = await import("../engines/php.engine");

    expect(phpEngine.fileConfig).toMatchObject(phpFileSettings);
    // The engine never runs code through its file config; execution lives in the actions hook.
    expect("executeRunner" in phpEngine.fileConfig).toBe(false);
  });
});
