import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useJsonParser } from "./useJsonParser";

describe("useJsonParser", () => {
  it("should return invalid for empty string", () => {
    const { result } = renderHook(() => useJsonParser(""));

    expect(result.current.isValid).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should return invalid for whitespace only", () => {
    const { result } = renderHook(() => useJsonParser("   "));

    expect(result.current.isValid).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should return valid for simple object", () => {
    const { result } = renderHook(() => useJsonParser('{"name": "John"}'));

    expect(result.current.isValid).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("should return valid for array", () => {
    const { result } = renderHook(() => useJsonParser("[1, 2, 3]"));

    expect(result.current.isValid).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("should return invalid for malformed JSON", () => {
    const { result } = renderHook(() => useJsonParser("{invalid}"));

    expect(result.current.isValid).toBe(false);
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBeDefined();
  });

  it("should return invalid for unclosed bracket", () => {
    const { result } = renderHook(() => useJsonParser('{"name": "John"'));

    expect(result.current.isValid).toBe(false);
    expect(result.current.error).not.toBeNull();
  });

  it("should return valid for nested object", () => {
    const input = '{"user": {"name": "Jane", "age": 25}}';
    const { result } = renderHook(() => useJsonParser(input));

    expect(result.current.isValid).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("should update when input changes", () => {
    const { result, rerender } = renderHook(
      ({ input }) => useJsonParser(input),
      { initialProps: { input: "{invalid}" } },
    );

    expect(result.current.isValid).toBe(false);

    rerender({ input: '{"valid": true}' });

    expect(result.current.isValid).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("should return valid for primitive values", () => {
    const { result } = renderHook(() => useJsonParser("123"));

    expect(result.current.isValid).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("should return valid for null", () => {
    const { result } = renderHook(() => useJsonParser("null"));

    expect(result.current.isValid).toBe(true);
    expect(result.current.error).toBeNull();
  });
});
