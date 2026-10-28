// @vitest-environment node
import { describe, it, expect } from "vitest";
import { detectJsonLoss } from "./lossDetection";

describe("detectJsonLoss", () => {
  it("reports nothing for ordinary JSON", () => {
    expect(detectJsonLoss('{"a": 1, "b": [1.5, -2e3, 0, 9007199254740991], "c": "x"}')).toEqual({
      precisionLoss: false,
      duplicateKeys: false,
    });
  });

  it("flags integers beyond the safe range that don't survive a round-trip", () => {
    expect(detectJsonLoss('{"id": 12345678901234567890}').precisionLoss).toBe(true);
    expect(detectJsonLoss("[9007199254740993]").precisionLoss).toBe(true);
  });

  it("does not flag large integers that a double represents exactly", () => {
    expect(detectJsonLoss("[9007199254740992]").precisionLoss).toBe(false);
  });

  it("flags numbers that overflow to Infinity or underflow to zero", () => {
    expect(detectJsonLoss('{"x": 1e400}').precisionLoss).toBe(true);
    expect(detectJsonLoss('{"x": -1e400}').precisionLoss).toBe(true);
    expect(detectJsonLoss('{"x": 1e-400}').precisionLoss).toBe(true);
    expect(detectJsonLoss('{"x": 0.0e5}').precisionLoss).toBe(false);
  });

  it("flags decimals with more significant digits than a double holds", () => {
    expect(detectJsonLoss("[0.123456789012345678901]").precisionLoss).toBe(true);
    expect(detectJsonLoss("[1.50000000000000000000]").precisionLoss).toBe(false);
  });

  it("ignores digits inside strings", () => {
    expect(detectJsonLoss('{"id": "12345678901234567890"}').precisionLoss).toBe(false);
  });

  it("flags duplicate keys in the same object, including escaped spellings", () => {
    expect(detectJsonLoss('{"a": 1, "a": 2}').duplicateKeys).toBe(true);
    expect(detectJsonLoss('{"a": 1, "\\u0061": 2}').duplicateKeys).toBe(true);
    expect(detectJsonLoss('{"x": {"a": 1, "b": {"a": 2}}, "y": [{"a": 1}, {"a": 2}]}').duplicateKeys).toBe(
      false,
    );
    expect(detectJsonLoss('[{"k": 1}, {"k": 2, "v": {"k": 3, "k": 4}}]').duplicateKeys).toBe(true);
  });

  it("does not treat string values as keys", () => {
    expect(detectJsonLoss('{"a": "a", "b": "a"}').duplicateKeys).toBe(false);
  });
});
