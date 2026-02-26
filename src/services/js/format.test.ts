import { describe, it, expect } from "vitest";
import { formatJs } from "@/services/format/formatter";

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
