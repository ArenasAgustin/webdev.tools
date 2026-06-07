import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSqlPlaygroundActions } from "./useSqlPlaygroundActions";
import type { SqlExecuteResult } from "@/types/sql";

const { executeSqlAsyncMock, resetSqlAsyncMock, formatSqlAsyncMock, minifySqlAsyncMock } =
  vi.hoisted(() => ({
    executeSqlAsyncMock: vi.fn<(input: string) => Promise<{ ok: boolean; value?: SqlExecuteResult; error?: string }>>(),
    resetSqlAsyncMock: vi.fn<() => Promise<{ ok: boolean; value?: string; error?: string }>>(),
    formatSqlAsyncMock: vi.fn<(input: string) => Promise<{ ok: boolean; value?: string; error?: string }>>(),
    minifySqlAsyncMock: vi.fn<(input: string) => Promise<{ ok: boolean; value?: string; error?: string }>>(),
  }));

vi.mock("@/services/sql/worker", () => ({
  executeSqlAsync: executeSqlAsyncMock,
  resetSqlAsync: resetSqlAsyncMock,
  formatSqlAsync: formatSqlAsyncMock,
  minifySqlAsync: minifySqlAsyncMock,
}));

const mockResult: SqlExecuteResult = {
  columns: ["id", "name"],
  rows: [[1, "Alice"]],
  elapsedMs: 10,
  truncated: false,
};

function makeProps(overrides = {}) {
  return {
    inputSql: "SELECT * FROM users",
    setInputSql: vi.fn(),
    output: "",
    setOutput: vi.fn(),
    setError: vi.fn(),
    formatConfig: { dialect: "sql" as const, tabWidth: 2 },
    minifyConfig: { autoCopy: false },
    toast: { success: vi.fn(), error: vi.fn() },
    ...overrides,
  };
}

describe("useSqlPlaygroundActions", () => {
  beforeEach(() => {
    executeSqlAsyncMock.mockResolvedValue({ ok: true, value: mockResult });
    resetSqlAsyncMock.mockResolvedValue({ ok: true, value: "reset" });
    formatSqlAsyncMock.mockResolvedValue({ ok: true, value: "SELECT * FROM users" });
    minifySqlAsyncMock.mockResolvedValue({ ok: true, value: "SELECT * FROM users" });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("exposes handleExecute, handleReset, isExecuting, isFirstRun", () => {
    const props = makeProps();
    const { result } = renderHook(() => useSqlPlaygroundActions(props));

    expect(typeof result.current.handleExecute).toBe("function");
    expect(typeof result.current.handleReset).toBe("function");
    expect(result.current.isExecuting).toBe(false);
    expect(result.current.isFirstRun).toBe(true);
  });

  it("execute resolves and sets output as JSON", async () => {
    const props = makeProps();
    const { result } = renderHook(() => useSqlPlaygroundActions(props));

    act(() => {
      result.current.handleExecute();
    });

    // isExecuting is true during execution
    expect(result.current.isExecuting).toBe(true);

    await waitFor(() => {
      expect(result.current.isExecuting).toBe(false);
    });

    expect(props.setOutput).toHaveBeenCalledWith(JSON.stringify(mockResult, null, 2));
    expect(props.setError).toHaveBeenCalledWith(null);
    expect(props.toast.success).toHaveBeenCalledWith("Consulta ejecutada correctamente");
  });

  it("isFirstRun becomes false after first execute", async () => {
    const props = makeProps();
    const { result } = renderHook(() => useSqlPlaygroundActions(props));

    expect(result.current.isFirstRun).toBe(true);

    act(() => {
      result.current.handleExecute();
    });

    await waitFor(() => {
      expect(result.current.isFirstRun).toBe(false);
    });
  });

  it("execute error sets error and shows error toast", async () => {
    executeSqlAsyncMock.mockResolvedValue({ ok: false, error: "syntax error near SELEKT" });
    const props = makeProps();
    const { result } = renderHook(() => useSqlPlaygroundActions(props));

    act(() => {
      result.current.handleExecute();
    });

    await waitFor(() => {
      expect(result.current.isExecuting).toBe(false);
    });

    expect(props.setError).toHaveBeenCalledWith("syntax error near SELEKT");
    expect(props.toast.error).toHaveBeenCalledWith("syntax error near SELEKT");
    // isFirstRun still becomes false
    expect(result.current.isFirstRun).toBe(false);
  });

  it("execute with empty input shows error toast and does not call executeSqlAsync", () => {
    const props = makeProps({ inputSql: "" });
    const { result } = renderHook(() => useSqlPlaygroundActions(props));

    act(() => {
      result.current.handleExecute();
    });

    expect(props.toast.error).toHaveBeenCalledWith("No hay SQL para ejecutar");
    expect(executeSqlAsyncMock).not.toHaveBeenCalled();
  });

  it("execute with inputTooLarge shows error toast", () => {
    const props = makeProps({ inputTooLarge: true, inputTooLargeMessage: "Too large" });
    const { result } = renderHook(() => useSqlPlaygroundActions(props));

    act(() => {
      result.current.handleExecute();
    });

    expect(props.toast.error).toHaveBeenCalledWith("Too large");
    expect(executeSqlAsyncMock).not.toHaveBeenCalled();
  });

  it("reset clears output and error, sets isFirstRun back to true", async () => {
    const props = makeProps({ output: "some output" });
    const { result } = renderHook(() => useSqlPlaygroundActions(props));

    // First run to set isFirstRun false
    act(() => {
      result.current.handleExecute();
    });
    await waitFor(() => expect(result.current.isFirstRun).toBe(false));

    // Then reset
    act(() => {
      result.current.handleReset();
    });

    await waitFor(() => {
      expect(result.current.isFirstRun).toBe(true);
    });

    expect(props.setOutput).toHaveBeenCalledWith("");
    expect(props.setError).toHaveBeenCalledWith(null);
    expect(props.toast.success).toHaveBeenCalledWith("Base de datos reseteada");
  });

  it("isProcessing is true while executing", async () => {
    let resolve: (v: { ok: true; value: SqlExecuteResult }) => void = () => {};
    executeSqlAsyncMock.mockImplementation(
      () => new Promise((res) => { resolve = res; }),
    );

    const props = makeProps();
    const { result } = renderHook(() => useSqlPlaygroundActions(props));

    act(() => {
      result.current.handleExecute();
    });

    expect(result.current.isProcessing).toBe(true);

    act(() => {
      resolve({ ok: true, value: mockResult });
    });

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false);
    });
  });
});
