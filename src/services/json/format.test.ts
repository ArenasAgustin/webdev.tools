import { describe, it, expect } from "vitest";
import { formatJson } from "@/services/format/formatter";

describe("formatJson", () => {
  it("should format minified JSON", async () => {
    const input = '{"name":"John","age":30}';
    const result = await formatJson(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('{\n  "name": "John",\n  "age": 30\n}');
    }
  });

  it("should format with custom indent", async () => {
    const input = '{"name":"John"}';
    const result = await formatJson(input, { indent: 4 });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('{\n    "name": "John"\n}');
    }
  });

  it("should sort keys when sortKeys is true", async () => {
    const input = '{"z": 1, "a": 2, "m": 3}';
    const result = await formatJson(input, { sortKeys: true });

    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.value);
      const keys = Object.keys(parsed);
      expect(keys).toEqual(["a", "m", "z"]);
    }
  });

  it("should sort nested object keys", async () => {
    const input = '{"z": {"c": 1, "a": 2}, "a": 3}';
    const result = await formatJson(input, { sortKeys: true });

    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.value);
      expect(Object.keys(parsed)).toEqual(["a", "z"]);
      expect(Object.keys(parsed.z as object)).toEqual(["a", "c"]);
    }
  });

  it("should handle arrays correctly", async () => {
    const input = "[3, 1, 2]";
    const result = await formatJson(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("[\n  3,\n  1,\n  2\n]");
    }
  });

  it("should handle nested arrays and objects", async () => {
    const input = '{"arr":[{"b":2,"a":1}]}';
    const result = await formatJson(input, { sortKeys: true });

    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.value);
      expect(Object.keys((parsed.arr as Record<string, number>[])[0])).toEqual(["a", "b"]);
    }
  });

  it("should handle empty string", async () => {
    const result = await formatJson("");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe("El JSON está vacío");
    }
  });

  it("should handle invalid JSON", async () => {
    const result = await formatJson("{invalid}");

    expect(result.ok).toBe(false);
  });

  it("should preserve data types", async () => {
    const input = '{"string":"text","number":123,"boolean":true,"null":null}';
    const result = await formatJson(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.value);
      expect(typeof parsed.string).toBe("string");
      expect(typeof parsed.number).toBe("number");
      expect(typeof parsed.boolean).toBe("boolean");
      expect(parsed.null).toBeNull();
    }
  });

  it("should use default indent of 2 spaces", async () => {
    const input = '{"a":1}';
    const result = await formatJson(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain('  "a": 1');
    }
  });
});
