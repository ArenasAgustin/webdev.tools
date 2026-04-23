// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { formatCss, minifyCss, cleanCss, validateCss } from "./transform";

vi.mock("css-tree", async (importOriginal) => {
  const actual = await importOriginal<typeof import("css-tree")>();
  return { ...actual, parse: vi.fn(actual.parse) };
});

describe("validateCss", () => {
  it("returns ok:true for valid CSS", async () => {
    const input = ".foo { color: red; }";
    const result = await validateCss(input);
    expect(result).toEqual({ ok: true, value: input });
  });

  it("returns ok:false for invalid pseudo-class", async () => {
    const result = await validateCss(".foo:(3,3,43) { margin: 5px; }");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.length).toBeGreaterThan(0);
  });

  it("returns ok:true with empty value for empty string", async () => {
    const result = await validateCss("");
    expect(result).toEqual({ ok: true, value: "" });
  });

  it("returns ok:true with empty value for whitespace-only string", async () => {
    const result = await validateCss("   ");
    expect(result).toEqual({ ok: true, value: "" });
  });

  it("returns ok:true for CSS custom properties", async () => {
    const input = ":root { --my-color: red; }";
    const result = await validateCss(input);
    expect(result).toEqual({ ok: true, value: input });
  });

  it("returns ok:true for vendor-prefixed rules", async () => {
    const input = ".foo { -webkit-transform: rotate(45deg); }";
    const result = await validateCss(input);
    expect(result).toEqual({ ok: true, value: input });
  });

  it("returns ok:true for @media block", async () => {
    const input = "@media (max-width: 768px) { .foo { color: red; } }";
    const result = await validateCss(input);
    expect(result).toEqual({ ok: true, value: input });
  });

  it("returns ok:true for @keyframes block", async () => {
    const input = "@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }";
    const result = await validateCss(input);
    expect(result).toEqual({ ok: true, value: input });
  });

  it("catches css-tree internal throw and returns ok:false", async () => {
    const csstree = await import("css-tree");
    vi.mocked(csstree.parse).mockImplementationOnce(() => {
      throw new Error("internal css-tree error");
    });

    const result = await validateCss(".foo { color: red; }");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("internal css-tree error");
  });
});

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

  it("skips comment stripping when removeComments is false", async () => {
    const result = await minifyCss("/* keep this */ .card { color: red; }", {
      removeComments: false,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("keep this");
    }
  });

  it("returns trimmed source without compacting when removeSpaces is false", async () => {
    const result = await minifyCss(".card { color: red; }", { removeSpaces: false });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain(".card");
      expect(result.value).toContain("color: red");
    }
  });

  it("preserves string literals during minification", async () => {
    const result = await minifyCss('.card { content: "hello world"; color: red; }');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain('"hello world"');
      expect(result.value).toContain("color:red");
    }
  });

  it("preserves single-quoted string literals during minification", async () => {
    const result = await minifyCss(".card { content: 'hello world'; color: blue; }");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("'hello world'");
    }
  });
});

describe("cleanCss", () => {
  it("returns error for empty input", () => {
    const result = cleanCss("   ");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("vacío");
  });

  it("removes empty rules by default", () => {
    const result = cleanCss(".empty { } .used { color: red; }");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).not.toContain(".empty");
      expect(result.value).toContain(".used");
    }
  });

  it("keeps empty rules when removeEmptyRules is false", () => {
    const result = cleanCss(".empty { } .used { color: red; }", { removeEmptyRules: false });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain(".empty");
    }
  });

  it("removes rules with only comments by default", () => {
    const result = cleanCss(".commented { /* nothing */ } .real { color: blue; }");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).not.toContain(".commented");
      expect(result.value).toContain(".real");
    }
  });

  it("keeps comment-only rules when removeRulesWithOnlyComments is false", () => {
    const result = cleanCss(".commented { /* nothing */ }", {
      removeRulesWithOnlyComments: false,
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toContain(".commented");
  });

  it("preserves valid rules untouched", () => {
    const result = cleanCss(".box { display: flex; gap: 1rem; }");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain(".box");
      expect(result.value).toContain("display: flex");
    }
  });

  it("removes multiple empty rules", () => {
    const css = ".a {} .b {} .c { color: green; } .d {}";
    const result = cleanCss(css);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).not.toContain(".a");
      expect(result.value).not.toContain(".b");
      expect(result.value).not.toContain(".d");
      expect(result.value).toContain(".c");
    }
  });
});
