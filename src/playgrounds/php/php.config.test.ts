import { describe, it, expect } from "vitest";
import { phpPlaygroundConfig } from "./php.config";

describe("phpPlaygroundConfig", () => {
  it("has correct id and name", () => {
    expect(phpPlaygroundConfig.id).toBe("php");
    expect(phpPlaygroundConfig.name).toBe("PHP tools");
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
