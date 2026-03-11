import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
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

  it("should return valid for simple object", async () => {
    const { result } = renderHook(() => useJsonParser('{"name": "John"}'));

    await waitFor(() => {
      expect(result.current.isValid).toBe(true);
    });
    expect(result.current.error).toBeNull();
  });

  it("should return valid for array", async () => {
    const { result } = renderHook(() => useJsonParser("[1, 2, 3]"));

    await waitFor(() => {
      expect(result.current.isValid).toBe(true);
    });
    expect(result.current.error).toBeNull();
  });

  it("should return invalid for malformed JSON", async () => {
    const { result } = renderHook(() => useJsonParser("{invalid}"));

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
    expect(result.current.isValid).toBe(false);
    expect(result.current.error?.message).toBeDefined();
  });

  it("should return invalid for unclosed bracket", async () => {
    const { result } = renderHook(() => useJsonParser('{"name": "John"'));

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
    expect(result.current.isValid).toBe(false);
  });

  it("should return valid for nested object", async () => {
    const input = '{"user": {"name": "Jane", "age": 25}}';
    const { result } = renderHook(() => useJsonParser(input));

    await waitFor(() => {
      expect(result.current.isValid).toBe(true);
    });
    expect(result.current.error).toBeNull();
  });

  it("should update when input changes", async () => {
    const { result, rerender } = renderHook(({ input }) => useJsonParser(input), {
      initialProps: { input: "{invalid}" },
    });

    await waitFor(() => {
      expect(result.current.isValid).toBe(false);
      expect(result.current.error).not.toBeNull();
    });

    rerender({ input: '{"valid": true}' });

    await waitFor(() => {
      expect(result.current.isValid).toBe(true);
    });
    expect(result.current.error).toBeNull();
  });

  it("should return valid for primitive values", async () => {
    const { result } = renderHook(() => useJsonParser("123"));

    await waitFor(() => {
      expect(result.current.isValid).toBe(true);
    });
    expect(result.current.error).toBeNull();
  });

  it("should return valid for null", async () => {
    const { result } = renderHook(() => useJsonParser("null"));

    await waitFor(() => {
      expect(result.current.isValid).toBe(true);
    });
    expect(result.current.error).toBeNull();
  });
});
