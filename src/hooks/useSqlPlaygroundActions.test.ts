import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSqlPlaygroundActions } from "./useSqlPlaygroundActions";
import type { SqlExecuteResult } from "@/types/sql";

const { executeSqlAsyncMock, resetSqlAsyncMock, formatSqlAsyncMock, minifySqlAsyncMock, downloadFileMock } =
  vi.hoisted(() => ({
    downloadFileMock: vi.fn(),
    executeSqlAsyncMock: vi.fn<
      (input: string) => Promise<{
        ok: boolean;
        value?: SqlExecuteResult;
        error?: string;
        databaseReset?: true;
        partial?: SqlExecuteResult;
      }>
    >(),
    resetSqlAsyncMock: vi.fn<() => Promise<{ ok: boolean; value?: string; error?: string }>>(),
    formatSqlAsyncMock: vi.fn<(input: string) => Promise<{ ok: boolean; value?: string; error?: string }>>(),
    minifySqlAsyncMock: vi.fn<(input: string) => Promise<{ ok: boolean; value?: string; error?: string }>>(),
  }));

vi.mock("@/utils/download", () => ({
  downloadFile: downloadFileMock,
}));

vi.mock("@/services/sql/worker", () => ({
  executeSqlAsync: executeSqlAsyncMock,
  resetSqlAsync: resetSqlAsyncMock,
  formatSqlAsync: formatSqlAsyncMock,
  minifySqlAsync: minifySqlAsyncMock,
}));

const mockResult: SqlExecuteResult = {
  resultSets: [{ statement: 1, columns: ["id", "name"], rows: [[1, "Alice"]], truncated: false }],
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

  it("execute error keeps the result sets of the statements that ran before it", async () => {
    executeSqlAsyncMock.mockResolvedValue({ ok: false, error: "Sentencia 2: no such table: nope", partial: mockResult });
    const props = makeProps();
    const { result } = renderHook(() => useSqlPlaygroundActions(props));

    act(() => {
      result.current.handleExecute();
    });

    await waitFor(() => {
      expect(result.current.isExecuting).toBe(false);
    });

    expect(props.setOutput).toHaveBeenLastCalledWith(JSON.stringify(mockResult, null, 2));
    expect(props.setError).toHaveBeenLastCalledWith("Sentencia 2: no such table: nope");
    expect(props.toast.error).toHaveBeenCalledWith("Sentencia 2: no such table: nope");
  });

  it("execute error toast shows a compact message, the panel keeps the details", async () => {
    const error = `Parse error on line 1:\n${"SELEKT * FROM users\n^---\n".repeat(200)}`;
    executeSqlAsyncMock.mockResolvedValue({ ok: false, error });
    const props = makeProps({ inputSql: "SELEKT * FROM users" });
    const { result } = renderHook(() => useSqlPlaygroundActions(props));

    act(() => {
      result.current.handleExecute();
    });

    await waitFor(() => {
      expect(props.toast.error).toHaveBeenCalledWith("Parse error on line 1:");
    });
    expect(props.setError).toHaveBeenCalledWith(error);
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

  it("after a timeout reset the next run shows the loading state again", async () => {
    executeSqlAsyncMock.mockResolvedValue({ ok: false, error: "timed out", databaseReset: true });
    const props = makeProps();
    const { result } = renderHook(() => useSqlPlaygroundActions(props));

    act(() => {
      result.current.handleExecute();
    });

    await waitFor(() => {
      expect(result.current.isExecuting).toBe(false);
    });
    expect(props.toast.error).toHaveBeenCalledWith("timed out");
    expect(result.current.isFirstRun).toBe(true);
  });

  it("reset failure shows the error and keeps the output", async () => {
    resetSqlAsyncMock.mockResolvedValue({ ok: false, error: "Reset failed" });
    const props = makeProps({ output: "some output" });
    const { result } = renderHook(() => useSqlPlaygroundActions(props));

    act(() => {
      result.current.handleReset();
    });

    await waitFor(() => {
      expect(props.toast.error).toHaveBeenCalledWith("Reset failed");
    });
    expect(props.toast.success).not.toHaveBeenCalled();
    expect(props.setOutput).not.toHaveBeenCalled();
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

  it("downloads an execution result as output.json with a JSON mime type", () => {
    const output = JSON.stringify(mockResult, null, 2);
    const { result } = renderHook(() => useSqlPlaygroundActions(makeProps({ output })));

    act(() => {
      result.current.handleDownloadOutput();
    });

    expect(downloadFileMock).toHaveBeenCalledWith(output, "output.json", "application/json");
  });

  it("downloads formatted SQL as output.sql with the SQL mime type", () => {
    const output = "SELECT *\nFROM users;";
    const { result } = renderHook(() => useSqlPlaygroundActions(makeProps({ output })));

    act(() => {
      result.current.handleDownloadOutput();
    });

    expect(downloadFileMock).toHaveBeenCalledWith(output, "output.sql", "application/sql");
  });
});
