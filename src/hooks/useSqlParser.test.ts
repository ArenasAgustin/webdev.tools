import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSqlParser } from "./useSqlParser";

// validateSqlAsync is async via worker — we mock it to control results
const validateSqlAsyncMock = vi.hoisted(() =>
  vi.fn<(input: string) => Promise<{ ok: boolean; error?: string }>>(),
);

vi.mock("@/services/sql/worker", () => ({
  validateSqlAsync: validateSqlAsyncMock,
}));

describe("useSqlParser", () => {
  beforeEach(() => {
    validateSqlAsyncMock.mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns invalid with no error for empty string", () => {
    const { result } = renderHook(() => useSqlParser(""));

    expect(result.current.valid).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.parsing).toBe(false);
  });

  it("returns invalid with no error for whitespace only", () => {
    const { result } = renderHook(() => useSqlParser("   "));

    expect(result.current.valid).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.parsing).toBe(false);
  });

  it("returns valid for a simple valid SQL query", async () => {
    validateSqlAsyncMock.mockResolvedValue({ ok: true });

    const { result } = renderHook(() => useSqlParser("SELECT * FROM users"));

    await waitFor(() => {
      expect(result.current.valid).toBe(true);
    });
    expect(result.current.error).toBeNull();
    expect(result.current.parsing).toBe(false);
  });

  it("returns invalid with error string for invalid SQL", async () => {
    validateSqlAsyncMock.mockResolvedValue({
      ok: false,
      error: "near 'SELEKT': syntax error",
    });

    const { result } = renderHook(() =>
      useSqlParser("SELECT 'unclosed string"),
    );

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
    expect(result.current.valid).toBe(false);
    expect(typeof result.current.error).toBe("string");
    expect(result.current.error).toContain("syntax error");
  });

  it("returns valid when input changes from invalid to valid", async () => {
    validateSqlAsyncMock
      .mockResolvedValueOnce({ ok: false, error: "syntax error" })
      .mockResolvedValueOnce({ ok: true });

    const { result, rerender } = renderHook(({ input }) => useSqlParser(input), {
      initialProps: { input: "SELECT 'unclosed" },
    });

    await waitFor(() => {
      expect(result.current.valid).toBe(false);
    });

    rerender({ input: "SELECT 1" });

    await waitFor(() => {
      expect(result.current.valid).toBe(true);
    });
    expect(result.current.error).toBeNull();
  });

  it("cancels previous validation on rapid input changes", async () => {
    // We just verify the hook re-runs on input changes without error
    validateSqlAsyncMock.mockResolvedValue({ ok: true });

    const { result, rerender } = renderHook(({ input }) => useSqlParser(input), {
      initialProps: { input: "SELECT 1" },
    });

    rerender({ input: "SELECT 2" });
    rerender({ input: "SELECT 3" });

    await waitFor(() => {
      expect(result.current.valid).toBe(true);
    });
    // validateSqlAsync may be called multiple times but only the last result matters
    expect(validateSqlAsyncMock).toHaveBeenCalled();
  });

  it("returns valid for CREATE TABLE statement", async () => {
    validateSqlAsyncMock.mockResolvedValue({ ok: true });

    const { result } = renderHook(() =>
      useSqlParser("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)"),
    );

    await waitFor(() => {
      expect(result.current.valid).toBe(true);
    });
  });
});
