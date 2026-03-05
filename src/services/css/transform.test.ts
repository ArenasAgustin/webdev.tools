import { describe, expect, it } from "vitest";
import { formatCss, minifyCss } from "./transform";

describe("formatCss", () => {
  it("returns empty output for blank input", async () => {
    const result = await formatCss(" \n\t  ");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("");
    }
  });

  it("formats css with prettier", async () => {
    const result = await formatCss(".card{color:red;margin:0}");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain(".card {");
      expect(result.value).toContain("color: red;");
    }
  });

  it("returns syntax error on invalid css", async () => {
    const result = await formatCss(".card { color: red;");

    expect(result.ok).toBe(false);
  });
});

describe("minifyCss", () => {
  it("returns empty output for blank input", async () => {
    const result = await minifyCss("   \n ");

    expect(result).toEqual({ ok: true, value: "" });
  });

  it("minifies css content", async () => {
    const result = await minifyCss(".card { color: red; margin: 0px; }");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain(".card");
      expect(result.value).toContain("color:red");
      expect(result.value).not.toContain("\n");
    }
  }, 10000);
});
