import { describe, it, expect } from "vitest";
import { cleanCss } from "./transform";

describe("cleanCss - empty rules", () => {
  it("should remove empty rules", () => {
    const input = `.class1 { }
.class2 { color: red; }
`;

    const result = cleanCss(input, {
      removeEmptyRules: true,
      removeRulesWithOnlyComments: false,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(".class2 { color: red; }");
    }
  });

  it("should remove rules with only comments", () => {
    const input = `.class1 { /* comment */ }
.class2 { color: red; }
`;

    const result = cleanCss(input, {
      removeEmptyRules: true,
      removeRulesWithOnlyComments: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(".class2 { color: red; }");
    }
  });

  it("should keep rules with comments and properties", () => {
    const input = `.class1 { /* comment */ color: red; }
.class2 { }
`;

    const result = cleanCss(input, {
      removeEmptyRules: true,
      removeRulesWithOnlyComments: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("color: red;");
      expect(result.value).not.toContain(".class2");
    }
  });

  it("should handle multiple empty rules", () => {
    const input = `.a { }
.b { }
.c { color: green; }
.d { }
`;

    const result = cleanCss(input, {
      removeEmptyRules: true,
      removeRulesWithOnlyComments: false,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(".c { color: green; }");
    }
  });

  it("should return error for empty input", () => {
    const result = cleanCss("   ");

    expect(result.ok).toBe(false);
  });

  it("should keep empty rules when disabled", () => {
    const input = `.class1 { }
.class2 { color: red; }
`;

    const result = cleanCss(input, {
      removeEmptyRules: false,
      removeRulesWithOnlyComments: false,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain(".class1 { }");
      expect(result.value).toContain(".class2 { color: red; }");
    }
  });
});
