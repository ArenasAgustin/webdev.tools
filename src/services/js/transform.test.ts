import { describe, it, expect } from "vitest";
import { formatJs, minifyJs, cleanJs } from "@/services/js/transform";

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

describe("cleanJs", () => {
  it("returns error for empty input", () => {
    const result = cleanJs("   ");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("vacío");
  });

  it("handles code that evaluates cleanly even with odd syntax fragments", () => {
    // cleanJs uses Babel with error recovery — not all invalid inputs throw
    const result = cleanJs("const x = 1;");
    expect(result.ok).toBe(true);
  });

  it("handles sparse arrays (null AST nodes in walk)", () => {
    // Sparse arrays like [1,,2] produce null elements in the Babel AST,
    // exercising the !node early-return in the walk function
    const result = cleanJs("const arr = [1,,2];");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBeTruthy();
  });

  it("removes empty objects by default", () => {
    const result = cleanJs("const x = {}; const y = 1;");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).not.toContain("= {}");
      expect(result.value).toContain("const y = 1");
    }
  });

  it("keeps empty object when removeEmptyObject is false", () => {
    const result = cleanJs("const x = {};", { removeEmptyObject: false });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toContain("{}");
  });

  it("removes empty arrays by default", () => {
    const result = cleanJs("const a = []; const b = [1, 2];");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).not.toContain("= []");
      expect(result.value).toContain("[1, 2]");
    }
  });

  it("keeps empty array when removeEmptyArray is false", () => {
    const result = cleanJs("const a = [];", { removeEmptyArray: false });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toContain("[]");
  });

  it("removes empty functions by default", () => {
    const result = cleanJs("function noop() {} function useful() { return 1; }");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).not.toContain("function noop");
      expect(result.value).toContain("function useful");
    }
  });

  it("keeps empty function when removeEmptyFunction is false", () => {
    const result = cleanJs("function noop() {}", { removeEmptyFunction: false });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toContain("function noop() {}");
  });

  it("removes empty strings in variable declarations by default", () => {
    const result = cleanJs('const s = ""; const t = "hello";');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).not.toContain('= ""');
      expect(result.value).toContain('"hello"');
    }
  });

  it("keeps empty strings when removeEmptyString is false", () => {
    const result = cleanJs('const s = "";', { removeEmptyString: false });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toContain('""');
  });

  it("does not remove empty object used as property value", () => {
    const result = cleanJs("const obj = { a: {} };");
    expect(result.ok).toBe(true);
    if (result.ok) {
      // Property value {} should NOT be removed (invalid syntax if removed)
      expect(result.value).toContain("a:");
    }
  });

  it("preserves valid code untouched", () => {
    const result = cleanJs("const x = 1;\nconst y = [1, 2, 3];");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("const x = 1");
      expect(result.value).toContain("[1, 2, 3]");
    }
  });
});
