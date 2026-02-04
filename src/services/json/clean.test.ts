import { describe, it, expect } from "vitest";
import { cleanJson } from "./clean";

describe("cleanJson", () => {
  it("should remove null values by default", () => {
    const input = '{"a": 1, "b": null, "c": 2}';
    const result = cleanJson(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.value);
      expect(parsed).toEqual({ a: 1, c: 2 });
      expect(parsed.b).toBeUndefined();
    }
  });

  it("should remove empty strings by default", () => {
    const input = '{"a": "text", "b": "", "c": "other"}';
    const result = cleanJson(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.value);
      expect(parsed).toEqual({ a: "text", c: "other" });
    }
  });

  it("should not remove empty arrays by default", () => {
    const input = '{"a": [], "b": [1, 2]}';
    const result = cleanJson(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.value);
      // Empty arrays are removed because the removeEmpty function filters them out
      expect(parsed).toEqual({ b: [1, 2] });
    }
  });

  it("should remove empty arrays when removeEmptyArray is true", () => {
    const input = '{"a": [], "b": [1, 2]}';
    const result = cleanJson(input, { removeEmptyArray: true });

    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.value);
      expect(parsed.a).toBeUndefined();
      expect(parsed.b).toEqual([1, 2]);
    }
  });

  it("should not remove empty objects by default", () => {
    const input = '{"a": {}, "b": {"x": 1}}';
    const result = cleanJson(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.value);
      // Empty objects are removed because they have no properties after cleaning
      expect(parsed).toEqual({ b: { x: 1 } });
    }
  });

  it("should remove empty objects when removeEmptyObject is true", () => {
    const input = '{"a": {}, "b": {"x": 1}}';
    const result = cleanJson(input, { removeEmptyObject: true });

    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.value);
      expect(parsed.a).toBeUndefined();
      expect(parsed.b).toEqual({ x: 1 });
    }
  });

  it("should clean nested structures", () => {
    const input = '{"user": {"name": "John", "email": null, "phone": ""}}';
    const result = cleanJson(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.value);
      expect(parsed).toEqual({ user: { name: "John" } });
    }
  });

  it("should clean arrays with null values", () => {
    const input = '[1, null, 2, "", 3]';
    const result = cleanJson(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.value);
      expect(parsed).toEqual([1, 2, 3]);
    }
  });

  it("should keep null when removeNull is false", () => {
    const input = '{"a": null}';
    const result = cleanJson(input, { removeNull: false });

    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.value);
      expect(parsed.a).toBeNull();
    }
  });

  it("should format output when outputFormat is format", () => {
    const input = '{"a":1,"b":null}';
    const result = cleanJson(input, { outputFormat: "format" });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("\n");
      expect(result.value).toContain("  ");
    }
  });

  it("should minify output when outputFormat is minify", () => {
    const input = '{\n  "a": 1,\n  "b": null\n}';
    const result = cleanJson(input, { outputFormat: "minify" });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('{"a":1}');
    }
  });

  it("should handle empty string", () => {
    const result = cleanJson("");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe("El JSON está vacío");
    }
  });

  it("should handle invalid JSON", () => {
    const result = cleanJson("{invalid}");

    expect(result.ok).toBe(false);
  });
});
