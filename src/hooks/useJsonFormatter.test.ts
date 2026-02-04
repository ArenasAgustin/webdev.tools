import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useJsonFormatter } from "./useJsonFormatter";

// Mock clipboard API
const mockWriteText = vi.fn(() => Promise.resolve());

beforeEach(() => {
  // Reset mocks before each test
  mockWriteText.mockClear();
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: mockWriteText },
    writable: true,
  });
});

describe("useJsonFormatter", () => {
  describe("format", () => {
    it("should format valid JSON", () => {
      const { result } = renderHook(() => useJsonFormatter());

      act(() => {
        result.current.format('{"name":"John"}');
      });

      expect(result.current.output).toContain('"name"');
      expect(result.current.output).toContain("John");
      expect(result.current.error).toBeNull();
    });

    it("should handle empty input", () => {
      const { result } = renderHook(() => useJsonFormatter());

      act(() => {
        result.current.format("");
      });

      expect(result.current.output).toBe("");
      expect(result.current.error).toBe("No hay JSON para formatear");
    });

    it("should handle invalid JSON", () => {
      const { result } = renderHook(() => useJsonFormatter());

      act(() => {
        result.current.format("{invalid}");
      });

      expect(result.current.output).toBe("");
      expect(result.current.error).not.toBeNull();
    });

    it("should copy to clipboard when autoCopy is true", async () => {
      const { result } = renderHook(() => useJsonFormatter());
      const writeTextSpy = vi.spyOn(navigator.clipboard, "writeText");

      act(() => {
        result.current.format('{"name":"John"}', { autoCopy: true });
      });

      await vi.waitFor(() => {
        expect(writeTextSpy).toHaveBeenCalled();
      });
    });

    it("should apply custom indent", () => {
      const { result } = renderHook(() => useJsonFormatter());

      act(() => {
        result.current.format('{"name":"John"}', { indent: 4 });
      });

      expect(result.current.output).toContain("    ");
      expect(result.current.error).toBeNull();
    });

    it("should sort keys when requested", () => {
      const { result } = renderHook(() => useJsonFormatter());

      act(() => {
        result.current.format('{"z":1,"a":2}', { sortKeys: true });
      });

      const aIndex = result.current.output.indexOf('"a"');
      const zIndex = result.current.output.indexOf('"z"');
      expect(aIndex).toBeLessThan(zIndex);
    });
  });

  describe("minify", () => {
    it("should minify valid JSON", () => {
      const { result } = renderHook(() => useJsonFormatter());

      act(() => {
        result.current.minify('{\n  "name": "John"\n}');
      });

      expect(result.current.output).toBe('{"name":"John"}');
      expect(result.current.error).toBeNull();
    });

    it("should handle empty input", () => {
      const { result } = renderHook(() => useJsonFormatter());

      act(() => {
        result.current.minify("");
      });

      expect(result.current.output).toBe("");
      expect(result.current.error).toBe("No hay JSON para minificar");
    });

    it("should handle invalid JSON", () => {
      const { result } = renderHook(() => useJsonFormatter());

      act(() => {
        result.current.minify("{invalid}");
      });

      expect(result.current.output).toBe("");
      expect(result.current.error).not.toBeNull();
    });

    it("should copy to clipboard when autoCopy is true", async () => {
      const { result } = renderHook(() => useJsonFormatter());
      const writeTextSpy = vi.spyOn(navigator.clipboard, "writeText");

      act(() => {
        result.current.minify('{"name":"John"}', { autoCopy: true });
      });

      await vi.waitFor(() => {
        expect(writeTextSpy).toHaveBeenCalled();
      });
    });
  });

  describe("clean", () => {
    it("should clean JSON removing null values", () => {
      const { result } = renderHook(() => useJsonFormatter());

      act(() => {
        result.current.clean('{"a":1,"b":null}');
      });

      const parsed = JSON.parse(result.current.output);
      expect(parsed).toEqual({ a: 1 });
      expect(result.current.error).toBeNull();
    });

    it("should handle empty input", () => {
      const { result } = renderHook(() => useJsonFormatter());

      act(() => {
        result.current.clean("");
      });

      expect(result.current.output).toBe("");
      expect(result.current.error).toBe("No hay JSON para limpiar");
    });

    it("should handle invalid JSON", () => {
      const { result } = renderHook(() => useJsonFormatter());

      act(() => {
        result.current.clean("{invalid}");
      });

      expect(result.current.output).toBe("");
      expect(result.current.error).not.toBeNull();
    });
  });

  describe("clearOutput", () => {
    it("should clear output and error", () => {
      const { result } = renderHook(() => useJsonFormatter());

      act(() => {
        result.current.format('{"name":"John"}');
      });

      expect(result.current.output).not.toBe("");

      act(() => {
        result.current.clearOutput();
      });

      expect(result.current.output).toBe("");
      expect(result.current.error).toBeNull();
    });
  });

  describe("state persistence", () => {
    it("should maintain state between operations", () => {
      const { result } = renderHook(() => useJsonFormatter());

      act(() => {
        result.current.format('{"name":"John"}');
      });

      const firstOutput = result.current.output;

      act(() => {
        result.current.minify('{"age":30}');
      });

      expect(result.current.output).not.toBe(firstOutput);
      expect(result.current.output).toBe('{"age":30}');
    });
  });
});
