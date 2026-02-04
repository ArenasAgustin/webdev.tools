import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTextStats } from "./useTextStats";

describe("useTextStats", () => {
  it("should return zeros for empty string", () => {
    const { result } = renderHook(() => useTextStats(""));

    expect(result.current.lines).toBe(0);
    expect(result.current.characters).toBe(0);
    expect(result.current.bytes).toBe(0);
  });

  it("should count single line correctly", () => {
    const { result } = renderHook(() => useTextStats("Hello World"));

    expect(result.current.lines).toBe(1);
    expect(result.current.characters).toBe(11);
    expect(result.current.bytes).toBe(11);
  });

  it("should count multiple lines", () => {
    const text = "Line 1\nLine 2\nLine 3";
    const { result } = renderHook(() => useTextStats(text));

    expect(result.current.lines).toBe(3);
    expect(result.current.characters).toBe(20);
  });

  it("should count JSON correctly", () => {
    const json = '{\n  "name": "John",\n  "age": 30\n}';
    const { result } = renderHook(() => useTextStats(json));

    expect(result.current.lines).toBe(4);
    expect(result.current.characters).toBe(json.length);
  });

  it("should handle unicode characters", () => {
    const text = "Hello 世界";
    const { result } = renderHook(() => useTextStats(text));

    expect(result.current.characters).toBe(8);
    expect(result.current.bytes).toBeGreaterThan(result.current.characters);
  });

  it("should handle special characters", () => {
    const text = "Hello\tWorld\r\n";
    const { result } = renderHook(() => useTextStats(text));

    expect(result.current.characters).toBe(13);
    expect(result.current.lines).toBe(2);
  });

  it("should update when text changes", () => {
    const { result, rerender } = renderHook(({ text }) => useTextStats(text), {
      initialProps: { text: "Short" },
    });

    expect(result.current.characters).toBe(5);

    rerender({ text: "This is a longer text" });

    expect(result.current.characters).toBe(21);
  });

  it("should handle empty lines", () => {
    const text = "Line 1\n\nLine 3";
    const { result } = renderHook(() => useTextStats(text));

    expect(result.current.lines).toBe(3);
  });

  it("should count bytes for multi-byte characters", () => {
    const text = "你好"; // Two Chinese characters
    const { result } = renderHook(() => useTextStats(text));

    expect(result.current.characters).toBe(2);
    expect(result.current.bytes).toBe(6); // Each Chinese char is 3 bytes in UTF-8
  });

  it("should handle emojis correctly", () => {
    const text = "Hello 👋";
    const { result } = renderHook(() => useTextStats(text));

    expect(result.current.characters).toBe(8);
    expect(result.current.bytes).toBeGreaterThan(8);
  });
});
