import { describe, it, expect } from "vitest";
import { formatJson } from "./format";

describe("formatJson", () => {
  it("should format minified JSON", () => {
    const input = '{"name":"John","age":30}';
    const result = formatJson(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('{\n  "name": "John",\n  "age": 30\n}');
    }
  });

  it("should format with custom indent", () => {
    const input = '{"name":"John"}';
    const result = formatJson(input, { indent: 4 });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('{\n    "name": "John"\n}');
    }
  });

  it("should sort keys when sortKeys is true", () => {
    const input = '{"z": 1, "a": 2, "m": 3}';
    const result = formatJson(input, { sortKeys: true });

    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.value);
      const keys = Object.keys(parsed);
      expect(keys).toEqual(["a", "m", "z"]);
    }
  });

  it("should sort nested object keys", () => {
    const input = '{"z": {"c": 1, "a": 2}, "a": 3}';
    const result = formatJson(input, { sortKeys: true });

    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.value);
      expect(Object.keys(parsed)).toEqual(["a", "z"]);
      expect(Object.keys(parsed.z as object)).toEqual(["a", "c"]);
    }
  });

  it("should handle arrays correctly", () => {
    const input = "[3, 1, 2]";
    const result = formatJson(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("[\n  3,\n  1,\n  2\n]");
    }
  });

  it("should handle nested arrays and objects", () => {
    const input = '{"arr":[{"b":2,"a":1}]}';
    const result = formatJson(input, { sortKeys: true });

    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.value);
      expect(
        Object.keys((parsed.arr as Array<Record<string, number>>)[0]),
      ).toEqual(["a", "b"]);
    }
  });

  it("should handle empty string", () => {
    const result = formatJson("");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe("El JSON está vacío");
    }
  });

  it("should handle invalid JSON", () => {
    const result = formatJson("{invalid}");

    expect(result.ok).toBe(false);
  });

  it("should preserve data types", () => {
    const input = '{"string":"text","number":123,"boolean":true,"null":null}';
    const result = formatJson(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.value);
      expect(typeof parsed.string).toBe("string");
      expect(typeof parsed.number).toBe("number");
      expect(typeof parsed.boolean).toBe("boolean");
      expect(parsed.null).toBeNull();
    }
  });

  it("should use default indent of 2 spaces", () => {
    const input = '{"a":1}';
    const result = formatJson(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain('  "a": 1');
    }
  });
});
