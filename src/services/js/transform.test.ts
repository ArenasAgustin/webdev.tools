import { describe, it, expect } from "vitest";
import { formatJs, minifyJs } from "@/services/js/transform";

describe("formatJs", () => {
  it("should format minified JavaScript", async () => {
    const input = "const x=1;function add(a,b){return a+b;}";
    const result = await formatJs(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("const x = 1;\nfunction add(a, b) {\n  return a + b;\n}");
    }
  });

  it("should format with custom indentation", async () => {
    const input = "if(true){console.log('ok');}";
    const result = await formatJs(input, 4);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain('    console.log("ok");');
    }
  });

  it("should format using tabs", async () => {
    const input = "if(true){console.log('ok');}";
    const result = await formatJs(input, "\t");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain('\tconsole.log("ok");');
    }
  });

  it("should return empty output for empty input", async () => {
    const result = await formatJs("   ");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("");
    }
  });

  it("should return error for invalid JavaScript", async () => {
    const result = await formatJs("const =");

    expect(result.ok).toBe(false);
  });
});

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
      expect(result.value).toContain("const");
      expect(result.value).not.toContain("// one");
      expect(result.value).not.toContain("block");
      expect(result.value.length).toBeLessThan(input.length);
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

  it("preserves readable output when removeSpaces is false", () => {
    const input = "const  a =  1;";
    const result = minifyJs(input, { removeSpaces: false });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("const");
      expect(result.value).toContain("=");
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
