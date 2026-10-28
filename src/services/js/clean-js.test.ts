// @vitest-environment node
import { describe, it, expect } from "vitest";
import { cleanJs } from "./transform";

describe("cleanJs - empty property values", () => {
  it("should NOT remove empty string from object property value", () => {
    const input = `const data = {
  nombre: "Test",
  vacio: "",
  activo: true
};`;

    const result = cleanJs(input, {
      removeEmptyObject: true,
      removeEmptyArray: true,
      removeEmptyFunction: true,
      removeEmptyString: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      // Should keep the empty string as property value
      expect(result.value).toContain('vacio: ""');
      expect(result.value).not.toContain("vacio: ,");
    }
  });

  it("should NOT remove empty array from object property value", () => {
    const input = `const data = {
  nombre: "Test",
  arrayVacio: [],
  activo: true
};`;

    const result = cleanJs(input, {
      removeEmptyObject: true,
      removeEmptyArray: true,
      removeEmptyFunction: true,
      removeEmptyString: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      // Should keep the empty array as property value
      expect(result.value).toContain("arrayVacio: []");
    }
  });

  it("should NOT remove empty object from object property value", () => {
    const input = `const data = {
  nombre: "Test",
  objetoVacio: {},
  activo: true
};`;

    const result = cleanJs(input, {
      removeEmptyObject: true,
      removeEmptyArray: true,
      removeEmptyFunction: true,
      removeEmptyString: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      // Should keep the empty object as property value
      expect(result.value).toContain("objetoVacio: {}");
    }
  });

  it("should NOT remove empty function from object property value", () => {
    const input = `const data = {
  nombre: "Test",
  funcionVacia: function() {},
  activo: true
};`;

    const result = cleanJs(input, {
      removeEmptyObject: true,
      removeEmptyArray: true,
      removeEmptyFunction: true,
      removeEmptyString: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      // Should keep the empty function as property value
      expect(result.value).toContain("funcionVacia: function");
    }
  });

  it("should remove standalone empty strings", () => {
    const input = `const a = "";
const b = "";`;

    const result = cleanJs(input, {
      removeEmptyObject: true,
      removeEmptyArray: true,
      removeEmptyFunction: true,
      removeEmptyString: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      // Should remove standalone empty strings
      expect(result.value).not.toContain('""');
    }
  });

  it("should remove entire variable declarations with empty values", () => {
    const input = `const str = "";
const obj = {};
const arr = [];
const func1 = () => {};
const func2 = function() {};`;

    const result = cleanJs(input, {
      removeEmptyObject: true,
      removeEmptyArray: true,
      removeEmptyFunction: true,
      removeEmptyString: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      // Should completely remove all declarations, not leave invalid syntax
      expect(result.value).not.toContain("str = ;");
      expect(result.value).not.toContain("obj = ;");
      expect(result.value).not.toContain("arr = ;");
      expect(result.value).not.toContain("func1 = ;");
      expect(result.value).not.toContain("func2 = ;");
      // Should be empty or just whitespace
      expect(result.value.trim()).toBe("");
    }
  });

  it("should remove empty function declarations", () => {
    const input = `function func3() {}`;

    const result = cleanJs(input, {
      removeEmptyObject: true,
      removeEmptyArray: true,
      removeEmptyFunction: true,
      removeEmptyString: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      // Should remove the entire function declaration
      expect(result.value.trim()).toBe("");
    }
  });
});

describe("cleanJs - output stays valid and keeps non-empty code", () => {
  const clean = (input: string) => {
    const result = cleanJs(input);
    if (!result.ok) throw new Error(result.error);
    return result.value;
  };

  it("removes only the empty declarators of a multi-declarator declaration", () => {
    expect(clean('let a = "", b = [], c = 1;')).toBe("let c = 1;");
  });

  it("removes a declaration whose declarators are all empty", () => {
    expect(clean('let a = "", b = [];\nconst d = 1;')).toBe("const d = 1;");
  });

  it("removes empty array elements without leaving holes", () => {
    expect(clean('const arr = [1, "", [], {}, 2];')).toBe("const arr = [1, 2];");
    expect(clean('const arr = [1, ""];')).toBe("const arr = [1];");
    expect(clean('const arr = ["", [], 3];')).toBe("const arr = [3];");
  });

  it("keeps call arguments untouched", () => {
    expect(clean('foo("", [], {});')).toBe('foo("", [], {});');
    expect(clean("items.forEach(() => {});")).toBe("items.forEach(() => {});");
  });

  it("removes a whole assignment statement with an empty value", () => {
    expect(clean('x = "";\ny = 1;')).toBe("y = 1;");
  });

  it("keeps empty values inside expressions", () => {
    expect(clean('if (a === "") run();')).toBe('if (a === "") run();');
    expect(clean('const s = cond ? "" : "x";')).toBe('const s = cond ? "" : "x";');
  });

  it("does not rewrite separators inside unrelated code", () => {
    expect(clean("for (;;) break;")).toBe("for (;;) break;");
    expect(clean('const s = "a,,b;;c";')).toBe('const s = "a,,b;;c";');
  });
});

describe("cleanJs - keeps program semantics", () => {
  const clean = (input: string) => {
    const result = cleanJs(input);
    if (!result.ok) throw new Error(result.error);
    return result.value;
  };

  it.each([
    ["the body of an if", "if (a) x = [];\nconsole.log(1);"],
    ["the body of an else", "if (a) y = 1; else x = {};\nfoo();"],
    ["the body of a loop", "while (a) x = [];\nfoo();"],
    ["a labeled statement", "lbl: x = [];\ny();"],
  ])("keeps an assignment that is %s", (_, input) => {
    expect(clean(input)).toBe(input);
  });

  it("keeps empty return values", () => {
    expect(clean("function f() { return []; }")).toBe("function f() { return []; }");
    expect(clean('const g = () => { return ""; };\ng();')).toBe(
      'const g = () => { return ""; };\ng();',
    );
  });

  it("keeps exported declarations", () => {
    expect(clean("export const x = {};\nexport const y = 1;")).toBe(
      "export const x = {};\nexport const y = 1;",
    );
    expect(clean("export function noop() {}")).toBe("export function noop() {}");
  });

  it("keeps declarations whose binding is used elsewhere", () => {
    expect(clean("const list = [];\nlist.push(1);")).toBe("const list = [];\nlist.push(1);");
    expect(clean("const noop = () => {};\nnoop();")).toBe("const noop = () => {};\nnoop();");
    expect(clean("function noop() {}\nnoop();")).toBe("function noop() {}\nnoop();");
    expect(clean("let a = [], b = 1;\nuse(a, b);")).toBe("let a = [], b = 1;\nuse(a, b);");
    expect(clean("const Empty = () => {};\nrender(<Empty />);")).toBe(
      "const Empty = () => {};\nrender(<Empty />);",
    );
  });

  it("keeps assignments to a binding that is read elsewhere", () => {
    expect(clean("let x = 1;\nx = [];\nconsole.log(x);")).toBe(
      "let x = 1;\nx = [];\nconsole.log(x);",
    );
    expect(clean("obj.items = [];")).toBe("obj.items = [];");
  });

  it("still removes unused empty declarations next to used ones", () => {
    expect(clean("const unused = [];\nconst used = {};\nfoo(used);")).toBe(
      "const used = {};\nfoo(used);",
    );
    expect(clean("const other = { unused: 1 };\nconst unused = [];")).toBe(
      "const other = { unused: 1 };",
    );
  });
});
