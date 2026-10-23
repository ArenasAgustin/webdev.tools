// @vitest-environment node
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

describe("cleanCss - literals and nesting", () => {
  const clean = (input: string) => {
    const result = cleanCss(input);
    if (!result.ok) throw new Error(result.error);
    return result.value;
  };

  it("keeps braces and comment-like text inside string literals", () => {
    expect(clean('a::before { content: "{ }"; }')).toBe('a::before { content: "{ }"; }');
    expect(clean('a::before { content: "{ /* x */ }"; }')).toBe(
      'a::before { content: "{ /* x */ }"; }',
    );
  });

  it("removes an at-rule block left empty after cleaning its rules", () => {
    expect(clean("@media (min-width: 1px) {\n  .a { }\n  .b { /* x */ }\n}\nc { color: red; }")).toBe(
      "c { color: red; }",
    );
  });

  it("does not remove declarations that precede an empty nested rule", () => {
    const value = clean("a {\n  color: red;\n  .b { }\n}");
    expect(value).toContain("color: red;");
    expect(value).not.toContain(".b");
  });
});
