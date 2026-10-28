import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import i18n from "i18next";
import type { ToastApi } from "./usePlaygroundActions";
import { useSqlPlaygroundActions } from "./useSqlPlaygroundActions";
import { useJsonPlaygroundActions } from "./useJsonPlaygroundActions";
import { useJsPlaygroundActions } from "./useJsPlaygroundActions";

const { executeSqlAsyncMock, resetSqlAsyncMock } = vi.hoisted(() => ({
  executeSqlAsyncMock: vi.fn(),
  resetSqlAsyncMock: vi.fn(),
}));

vi.mock("@/services/sql/worker", () => ({
  executeSqlAsync: executeSqlAsyncMock,
  resetSqlAsync: resetSqlAsyncMock,
  formatSqlAsync: vi.fn(),
  minifySqlAsync: vi.fn(),
}));

vi.mock("@/services/json/worker", () => ({
  formatJsonAsync: vi.fn(),
  minifyJsonAsync: vi.fn(),
  cleanJsonAsync: vi.fn(),
  applyJsonPathAsync: vi.fn(),
}));

vi.mock("@/services/js/worker", () => ({
  cleanJsAsync: vi.fn(),
}));

function makeToast(): ToastApi {
  return { success: vi.fn(), error: vi.fn() };
}

// Playground hooks translate at call time, so switching the shared i18n instance
// to English must change the messages they emit without re-creating the hooks.
describe("playground action hooks i18n (English)", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  afterEach(async () => {
    await i18n.changeLanguage("es");
    vi.clearAllMocks();
  });

  it("useSqlPlaygroundActions reports execution and reset in English", async () => {
    executeSqlAsyncMock.mockResolvedValue({
      ok: true,
      value: { resultSets: [], elapsedMs: 1, truncated: false },
    });
    resetSqlAsyncMock.mockResolvedValue({ ok: true, value: "reset" });
    const toast = makeToast();
    const { result } = renderHook(() =>
      useSqlPlaygroundActions({
        inputSql: "SELECT 1",
        setInputSql: vi.fn(),
        output: "",
        setOutput: vi.fn(),
        setError: vi.fn(),
        formatConfig: { dialect: "sql", tabWidth: 2 },
        minifyConfig: { autoCopy: false },
        toast,
      }),
    );

    act(() => {
      result.current.handleExecute();
      result.current.handleReset();
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Query executed successfully");
      expect(toast.success).toHaveBeenCalledWith("Database reset");
    });
  });

  it("useSqlPlaygroundActions rejects an empty query in English", () => {
    const toast = makeToast();
    const { result } = renderHook(() =>
      useSqlPlaygroundActions({
        inputSql: "  ",
        setInputSql: vi.fn(),
        output: "",
        setOutput: vi.fn(),
        setError: vi.fn(),
        formatConfig: { dialect: "sql", tabWidth: 2 },
        minifyConfig: { autoCopy: false },
        toast,
      }),
    );

    act(() => {
      result.current.handleExecute();
    });

    expect(toast.error).toHaveBeenCalledWith("No SQL to run");
  });

  it("useJsonPlaygroundActions asks for a JSONPath expression in English", async () => {
    const setError = vi.fn();
    const { result } = renderHook(() =>
      useJsonPlaygroundActions({
        inputJson: '{"a":1}',
        setInputJson: vi.fn(),
        output: "",
        setOutput: vi.fn(),
        setError,
        jsonPathExpression: " ",
        setJsonPathExpression: vi.fn(),
        addToHistory: vi.fn(),
        formatConfig: { indentSize: 2, sortKeys: false, autoCopy: false },
        minifyConfig: { removeSpaces: true, sortKeys: false, autoCopy: false },
        cleanConfig: {
          removeNull: true,
          removeUndefined: true,
          removeEmptyString: true,
          removeEmptyArray: true,
          removeEmptyObject: true,
          outputFormat: "format",
          autoCopy: false,
        },
        toast: makeToast(),
      }),
    );

    act(() => {
      result.current.handleApplyJsonPath();
    });

    await waitFor(() => {
      expect(setError).toHaveBeenCalledWith("Enter a JSONPath expression");
    });
  });

  it("useJsPlaygroundActions names the language in English for an empty input", async () => {
    const toast = makeToast();
    const { result } = renderHook(() =>
      useJsPlaygroundActions({
        inputJs: "",
        setInputJs: vi.fn(),
        output: "",
        setOutput: vi.fn(),
        setError: vi.fn(),
        formatConfig: { indentSize: 2, autoCopy: false },
        minifyConfig: { removeComments: true, removeSpaces: true, autoCopy: false },
        cleanConfig: {
          removeEmptyObject: true,
          removeEmptyArray: true,
          removeEmptyFunction: true,
          removeEmptyString: true,
          autoCopy: false,
        },
        toast,
      }),
    );

    act(() => {
      result.current.handleExecute();
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("No JavaScript to process");
    });
  });
});
