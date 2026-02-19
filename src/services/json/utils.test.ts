import { describe, it, expect } from "vitest";
import { sortJsonKeys, JSON_ERROR_MESSAGES } from "./utils";
import type { JsonValue } from "@/types/common";

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
