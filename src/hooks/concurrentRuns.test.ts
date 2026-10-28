import { afterEach, describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useJsPlaygroundActions } from "./useJsPlaygroundActions";
import { usePhpPlaygroundActions } from "./usePhpPlaygroundActions";
import { useSqlPlaygroundActions } from "./useSqlPlaygroundActions";
import { useJsonPlaygroundActions } from "./useJsonPlaygroundActions";
import { stubJsExecWorker } from "@/test/inProcessJsExecWorker";

const mocks = vi.hoisted(() => ({
  runJavaScript: vi.fn(),
  executePhpWithTimeout: vi.fn(),
  executeSqlAsync: vi.fn(),
  applyJsonPathAsync: vi.fn(),
  formatJsonAsync: vi.fn(),
}));

vi.mock("@/services/js/execute", () => ({ runJavaScript: mocks.runJavaScript }));
vi.mock("@/services/php/phpExecutor", () => ({
  executePhpWithTimeout: mocks.executePhpWithTimeout,
  isSharedArrayBufferSupported: () => true,
}));
vi.mock("@/services/sql/worker", () => ({
  executeSqlAsync: mocks.executeSqlAsync,
  resetSqlAsync: vi.fn(),
  formatSqlAsync: vi.fn(),
  minifySqlAsync: vi.fn(),
}));
vi.mock("@/services/json/worker", () => ({
  formatJsonAsync: mocks.formatJsonAsync,
  minifyJsonAsync: vi.fn(),
  cleanJsonAsync: vi.fn(),
  applyJsonPathAsync: mocks.applyJsonPathAsync,
}));

/** A promise whose settlement the test controls. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

const makeCallbacks = () => ({
  setOutput: vi.fn(),
  setError: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn() },
});

// While a run is in flight a second trigger (double click, keyboard shortcut) must be
// ignored, otherwise runs overlap and an older result can overwrite a newer one.
describe("overlapping runs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("JS execute ignores a second call while the first is running", async () => {
    stubJsExecWorker();
    const first = deferred<{ ok: true; output: string }>();
    mocks.runJavaScript.mockReturnValueOnce(first.promise);
    const { setOutput, setError, toast } = makeCallbacks();
    const { result } = renderHook(() =>
      useJsPlaygroundActions({
        inputJs: "console.log(1)",
        setInputJs: vi.fn(),
        output: "",
        setOutput,
        setError,
        formatConfig: {} as never,
        minifyConfig: {} as never,
        cleanConfig: {} as never,
        toast,
      }),
    );

    act(() => {
      result.current.handleExecute();
      result.current.handleExecute();
    });
    await act(async () => {
      first.resolve({ ok: true, output: "1" });
      await first.promise;
    });

    expect(mocks.runJavaScript).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(result.current.isProcessing).toBe(false));

    // Once finished, a new run is accepted again.
    mocks.runJavaScript.mockResolvedValueOnce({ ok: true, output: "2" });
    act(() => {
      result.current.handleExecute();
    });
    await waitFor(() => expect(mocks.runJavaScript).toHaveBeenCalledTimes(2));
  });

  it("PHP execute ignores a second call while the first is running", async () => {
    const first = deferred<{ ok: true; value: string }>();
    mocks.executePhpWithTimeout.mockReturnValueOnce(first.promise);
    // Warm the module cache so both calls get the mocked executor.
    await import("@/services/php/phpExecutor");
    const { setOutput, setError, toast } = makeCallbacks();
    const { result } = renderHook(() =>
      usePhpPlaygroundActions({
        inputPhp: "<?php echo 1;",
        setInputPhp: vi.fn(),
        output: "",
        setOutput,
        setError,
        formatConfig: {} as never,
        minifyConfig: {},
        toast,
      }),
    );

    act(() => {
      result.current.handleExecute();
      result.current.handleExecute();
    });
    await waitFor(() => expect(mocks.executePhpWithTimeout).toHaveBeenCalled());
    await act(async () => {
      // Let the second call's dynamic import settle before counting.
      await new Promise((r) => setTimeout(r, 20));
      first.resolve({ ok: true, value: "1" });
      await first.promise;
    });

    // Each started run clears the error first; only one run may have started.
    expect(setError.mock.calls.filter(([value]) => value === null)).toHaveLength(1);
    expect(toast.error).not.toHaveBeenCalled();
    expect(mocks.executePhpWithTimeout).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(result.current.isProcessing).toBe(false));
  });

  it("SQL execute (button or Ctrl+Shift+Enter) does not run the query twice", async () => {
    const first = deferred<{ ok: true; value: unknown }>();
    mocks.executeSqlAsync.mockReturnValueOnce(first.promise);
    const { setOutput, setError, toast } = makeCallbacks();
    const { result } = renderHook(() =>
      useSqlPlaygroundActions({
        inputSql: "INSERT INTO t VALUES (1)",
        setInputSql: vi.fn(),
        output: "",
        setOutput,
        setError,
        formatConfig: { dialect: "sql", tabWidth: 2 },
        minifyConfig: {},
        toast,
      }),
    );

    act(() => {
      result.current.handleExecute();
      result.current.handleExecute();
    });
    await act(async () => {
      first.resolve({ ok: true, value: { resultSets: [], elapsedMs: 1, truncated: false } });
      await first.promise;
    });

    expect(mocks.executeSqlAsync).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(result.current.isProcessing).toBe(false));
  });

  it("format ignores a second call while the first is running", async () => {
    const first = deferred<{ ok: true; value: string }>();
    mocks.formatJsonAsync.mockReturnValueOnce(first.promise);
    const { setOutput, setError, toast } = makeCallbacks();
    const { result } = renderHook(() =>
      useJsonPlaygroundActions({
        inputJson: '{"a":1}',
        setInputJson: vi.fn(),
        output: "",
        setOutput,
        setError,
        jsonPathExpression: "",
        setJsonPathExpression: vi.fn(),
        addToHistory: vi.fn(),
        formatConfig: {} as never,
        minifyConfig: {} as never,
        cleanConfig: {} as never,
        toast,
      }),
    );

    act(() => {
      result.current.handleFormat();
      result.current.handleFormat();
    });
    await act(async () => {
      first.resolve({ ok: true, value: '{\n  "a": 1\n}' });
      await first.promise;
    });

    expect(mocks.formatJsonAsync).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(result.current.isProcessing).toBe(false));
  });

  it("JSONPath apply keeps only the latest request's result", async () => {
    const slow = deferred<{ ok: true; value: string }>();
    const fast = deferred<{ ok: true; value: string }>();
    mocks.applyJsonPathAsync.mockReturnValueOnce(slow.promise).mockReturnValueOnce(fast.promise);
    const { setOutput, setError, toast } = makeCallbacks();
    const addToHistory = vi.fn();
    const { result, rerender } = renderHook(
      ({ expression }: { expression: string }) =>
        useJsonPlaygroundActions({
          inputJson: '{"a":1,"b":2}',
          setInputJson: vi.fn(),
          output: "",
          setOutput,
          setError,
          jsonPathExpression: expression,
          setJsonPathExpression: vi.fn(),
          addToHistory,
          formatConfig: {} as never,
          minifyConfig: {} as never,
          cleanConfig: {} as never,
          toast,
        }),
      { initialProps: { expression: "$.a" } },
    );

    act(() => {
      result.current.handleApplyJsonPath();
    });
    rerender({ expression: "$.b" });
    act(() => {
      result.current.handleApplyJsonPath();
    });

    await act(async () => {
      fast.resolve({ ok: true, value: "[2]" });
      await fast.promise;
    });
    await act(async () => {
      slow.resolve({ ok: true, value: "[1]" });
      await slow.promise;
    });

    await waitFor(() => expect(setOutput).toHaveBeenCalledWith("[2]"));
    expect(setOutput).not.toHaveBeenCalledWith("[1]");
    expect(addToHistory).toHaveBeenCalledTimes(1);
    expect(addToHistory).toHaveBeenCalledWith("$.b");
  });
});
