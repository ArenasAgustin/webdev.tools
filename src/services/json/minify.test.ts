import { describe, it, expect } from "vitest";
import { minifyJson } from "./minify";

describe("minifyJson", () => {
  it("should minify formatted JSON", () => {
    const input = '{\n  "name": "John",\n  "age": 30\n}';
    const result = minifyJson(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('{"name":"John","age":30}');
    }
  });

  it("should remove all whitespace", () => {
    const input = '  {  "a"  :  1  }  ';
    const result = minifyJson(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).not.toContain(" ");
      expect(result.value).toBe('{"a":1}');
    }
  });

  it("should sort keys when sortKeys is true", () => {
    const input = '{"z": 1, "a": 2}';
    const result = minifyJson(input, { sortKeys: true });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('{"a":2,"z":1}');
    }
  });

  it("should handle arrays", () => {
    const input = "[\n  1,\n  2,\n  3\n]";
    const result = minifyJson(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("[1,2,3]");
    }
  });

  it("should handle nested structures", () => {
    const input = '{\n  "user": {\n    "name": "John"\n  }\n}';
    const result = minifyJson(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('{"user":{"name":"John"}}');
    }
  });

  it("should handle empty string", () => {
    const result = minifyJson("");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe("El JSON está vacío");
    }
  });

  it("should handle invalid JSON", () => {
    const result = minifyJson("{invalid}");

    expect(result.ok).toBe(false);
  });

  it("should preserve data types", () => {
    const input = '{"string":"text","number":123,"boolean":true,"null":null}';
    const result = minifyJson(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.value);
      expect(typeof parsed.string).toBe("string");
      expect(typeof parsed.number).toBe("number");
      expect(typeof parsed.boolean).toBe("boolean");
      expect(parsed.null).toBeNull();
    }
  });
});
