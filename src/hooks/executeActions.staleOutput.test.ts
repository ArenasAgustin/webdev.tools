import { describe, expect, it, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useJsPlaygroundActions } from "./useJsPlaygroundActions";
import { usePhpPlaygroundActions } from "./usePhpPlaygroundActions";
import { useJsonPlaygroundActions } from "./useJsonPlaygroundActions";

// A failed run must not leave the previous result on screen next to the new error.
describe("stale output after a failed action", () => {
  const makeCallbacks = () => ({
    setOutput: vi.fn(),
    setError: vi.fn(),
    toast: { success: vi.fn(), error: vi.fn() },
  });

  it("JS execute on invalid (empty) input clears the previous output", async () => {
    const { setOutput, setError, toast } = makeCallbacks();
    const { result } = renderHook(() =>
      useJsPlaygroundActions({
        inputJs: "",
        setInputJs: vi.fn(),
        output: "previous result",
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
    });

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(setOutput).toHaveBeenCalledWith("");
  });

  it("PHP execute on invalid (empty) input clears the previous output", async () => {
    const { setOutput, setError, toast } = makeCallbacks();
    const { result } = renderHook(() =>
      usePhpPlaygroundActions({
        inputPhp: "",
        setInputPhp: vi.fn(),
        output: "previous result",
        setOutput,
        setError,
        formatConfig: {} as never,
        minifyConfig: {},
        toast,
      }),
    );

    act(() => {
      result.current.handleExecute();
    });

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(setOutput).toHaveBeenCalledWith("");
  });

  it("JSONPath with an empty expression clears the previous output", async () => {
    const { setOutput, setError, toast } = makeCallbacks();
    const { result } = renderHook(() =>
      useJsonPlaygroundActions({
        inputJson: '{"a":1}',
        setInputJson: vi.fn(),
        output: "previous result",
        setOutput,
        setError,
        jsonPathExpression: "  ",
        setJsonPathExpression: vi.fn(),
        addToHistory: vi.fn(),
        formatConfig: {} as never,
        minifyConfig: {} as never,
        cleanConfig: {} as never,
        toast,
      }),
    );

    act(() => {
      result.current.handleApplyJsonPath();
    });

    await waitFor(() => expect(setError).toHaveBeenCalled());
    expect(setOutput).toHaveBeenCalledWith("");
  });
});
