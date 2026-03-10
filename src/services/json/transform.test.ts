import { describe, it, expect } from "vitest";
import {
  formatJson,
  minifyJson,
  cleanJson,
  parseJson,
  sortJsonKeys,
  JSON_ERROR_MESSAGES,
} from "@/services/json/transform";
import type { JsonValue } from "@/types/common";

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
    const result = await formatJson(input, { indentSize: 4 });

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

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("");
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

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("");
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

describe("sortJsonKeys", () => {
  it("should sort object keys alphabetically", () => {
    const input = { c: 1, a: 2, b: 3 };
    const result = sortJsonKeys(input);
    expect(Object.keys(result as Record<string, unknown>)).toEqual(["a", "b", "c"]);
  });

  it("should sort nested object keys", () => {
    const input = { outer: { z: 1, x: 2, y: 3 } };
    const result = sortJsonKeys(input) as Record<string, Record<string, number>>;
    expect(Object.keys(result.outer)).toEqual(["x", "y", "z"]);
  });

  it("should handle arrays without sorting them", () => {
    const input = [3, 1, 2];
    const result = sortJsonKeys(input);
    expect(result).toEqual([3, 1, 2]);
  });

  it("should sort object keys inside arrays", () => {
    const input: JsonValue = [{ c: 1, a: 2 } as JsonValue, { z: 3, x: 4 } as JsonValue];
    const result = sortJsonKeys(input) as Record<string, number>[];
    expect(Object.keys(result[0])).toEqual(["a", "c"]);
    expect(Object.keys(result[1])).toEqual(["x", "z"]);
  });

  it("should handle primitive values", () => {
    expect(sortJsonKeys(42 as JsonValue)).toBe(42);
    expect(sortJsonKeys("hello" as JsonValue)).toBe("hello");
    expect(sortJsonKeys(true as JsonValue)).toBe(true);
    expect(sortJsonKeys(null as JsonValue)).toBe(null);
  });

  it("should handle deeply nested structures", () => {
    const input = {
      z: {
        y: {
          x: [{ c: 1, a: 2 }],
        },
      },
    };
    const result = sortJsonKeys(input) as typeof input;
    expect(Object.keys(result)).toEqual(["z"]);
    expect(Object.keys(result.z)).toEqual(["y"]);
    expect(Object.keys(result.z.y)).toEqual(["x"]);
    expect(Object.keys(result.z.y.x[0])).toEqual(["a", "c"]);
  });
});

describe("JSON_ERROR_MESSAGES", () => {
  it("should have EMPTY_INPUT message", () => {
    expect(JSON_ERROR_MESSAGES.EMPTY_INPUT).toBe("El JSON está vacío");
  });
});

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
