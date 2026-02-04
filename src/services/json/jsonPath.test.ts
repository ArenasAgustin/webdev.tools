import { describe, it, expect } from "vitest";
import { applyJsonPath } from "./jsonPath";

describe("applyJsonPath", () => {
  it("should extract single property", () => {
    const input = '{"name": "John", "age": 30}';
    const result = applyJsonPath(input, "$.name");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(JSON.parse(result.value)).toBe("John");
    }
  });

  it("should extract nested property", () => {
    const input = '{"user": {"profile": {"name": "Jane"}}}';
    const result = applyJsonPath(input, "$.user.profile.name");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(JSON.parse(result.value)).toBe("Jane");
    }
  });

  it("should extract array elements", () => {
    const input = '{"users": [{"name": "John"}, {"name": "Jane"}]}';
    const result = applyJsonPath(input, "$.users[*].name");

    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.value);
      expect(parsed).toEqual(["John", "Jane"]);
    }
  });

  it("should filter array elements", () => {
    const input =
      '{"users": [{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]}';
    const result = applyJsonPath(input, "$.users[?(@.age > 27)]");

    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.value);
      expect(parsed).toEqual([{ name: "John", age: 30 }]);
    }
  });

  it("should handle root selector", () => {
    const input = '{"name": "John"}';
    const result = applyJsonPath(input, "$");

    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.value);
      expect(parsed).toEqual({ name: "John" });
    }
  });

  it("should handle wildcard selector", () => {
    const input = '{"a": 1, "b": 2, "c": 3}';
    const result = applyJsonPath(input, "$.*");

    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.value);
      expect(parsed).toEqual([1, 2, 3]);
    }
  });

  it("should handle array index", () => {
    const input = '{"items": [10, 20, 30]}';
    const result = applyJsonPath(input, "$.items[1]");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(JSON.parse(result.value)).toBe(20);
    }
  });

  it("should handle array slice", () => {
    const input = '{"items": [1, 2, 3, 4, 5]}';
    const result = applyJsonPath(input, "$.items[1:3]");

    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.value);
      expect(parsed).toEqual([2, 3]);
    }
  });

  it("should return error for empty JSON", () => {
    const result = applyJsonPath("", "$.name");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe("El JSON está vacío");
    }
  });

  it("should return error for empty path", () => {
    const input = '{"name": "John"}';
    const result = applyJsonPath(input, "");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe("La expresión JSONPath está vacía");
    }
  });

  it("should return error for invalid JSON", () => {
    const result = applyJsonPath("{invalid}", "$.name");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("Error en JSONPath");
    }
  });

  it("should return result for non-matching path", () => {
    const input = '{"name": "John"}';
    const result = applyJsonPath(input, "$[invalid");

    // JSONPath library handles non-matching selectors gracefully
    // The wrap:false option means it returns undefined when no match
    // JSON.stringify(undefined) returns undefined (not a string)
    if (result.ok) {
      expect(result.value).toBeUndefined();
    } else {
      throw new Error("Expected successful result");
    }
  });

  it("should handle complex nested arrays", () => {
    const input =
      '{"store": {"books": [{"title": "Book1", "price": 10}, {"title": "Book2", "price": 15}]}}';
    const result = applyJsonPath(input, "$.store.books[?(@.price < 12)].title");

    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.value);
      expect(parsed).toEqual(["Book1"]);
    }
  });

  it("should handle recursive descent", () => {
    const input = '{"a": {"b": {"c": 1}}, "d": {"c": 2}}';
    const result = applyJsonPath(input, "$..c");

    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.value);
      expect(parsed).toEqual([1, 2]);
    }
  });
});
