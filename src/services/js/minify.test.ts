import { describe, it, expect } from "vitest";
import { minifyJs } from "@/services/minifier/minifier";

describe("minifyJs", () => {
  it("returns empty string for blank input", () => {
    expect(minifyJs("   \n  ")).toEqual({ ok: true, value: "" });
  });

  it("removes comments and spaces by default", () => {
    const input = `
      // one
      const a = 1;   
      /* block */
      const b = 2;
    `;

    const result = minifyJs(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("const a=1;");
      expect(result.value).toContain("const b=2;");
      expect(result.value).not.toContain("// one");
      expect(result.value).not.toContain("block");
    }
  });

  it("keeps comments when removeComments is false", () => {
    const input = "// keep\nconst a = 1;";
    const result = minifyJs(input, { removeComments: false, removeSpaces: false });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("// keep");
    }
  });

  it("keeps spacing shape when removeSpaces is false", () => {
    const input = "const  a =  1;";
    const result = minifyJs(input, { removeSpaces: false });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("const  a =  1;");
    }
  });

  it("returns error when input is not a string", () => {
    const result = minifyJs({} as never);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeTypeOf("string");
    }
  });
});
