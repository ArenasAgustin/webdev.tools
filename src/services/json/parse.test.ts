import { describe, it, expect } from "vitest";
import { parseJson } from "./parse";

describe("parseJson", () => {
  it("should parse valid JSON string", () => {
    const result = parseJson('{"name": "John", "age": 30}');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ name: "John", age: 30 });
    }
  });

  it("should parse valid JSON array", () => {
    const result = parseJson("[1, 2, 3]");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual([1, 2, 3]);
    }
  });

  it("should parse nested JSON", () => {
    const input = '{"user": {"name": "John", "address": {"city": "NYC"}}}';
    const result = parseJson(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        user: { name: "John", address: { city: "NYC" } },
      });
    }
  });

  it("should handle empty string", () => {
    const result = parseJson("");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe("El JSON está vacío");
    }
  });

  it("should handle whitespace-only string", () => {
    const result = parseJson("   \n\t  ");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe("El JSON está vacío");
    }
  });

  it("should handle invalid JSON", () => {
    const result = parseJson("{invalid json}");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("JSON");
    }
  });

  it("should handle malformed JSON with missing quotes", () => {
    const result = parseJson('{name: "John"}');

    expect(result.ok).toBe(false);
  });

  it("should handle JSON with trailing comma", () => {
    const result = parseJson('{"name": "John",}');

    expect(result.ok).toBe(false);
  });

  it("should parse JSON with special characters", () => {
    const result = parseJson('{"emoji": "😀", "unicode": "\\u0048"}');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ emoji: "😀", unicode: "H" });
    }
  });

  it("should parse JSON with null values", () => {
    const result = parseJson('{"value": null}');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ value: null });
    }
  });
});
