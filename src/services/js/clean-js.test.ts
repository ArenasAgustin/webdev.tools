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
