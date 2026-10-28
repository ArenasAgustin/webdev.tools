import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useJsPlaygroundActions } from "./useJsPlaygroundActions";
import { MAX_OUTPUT_CHARS, MAX_OUTPUT_LINES } from "@/services/js/execute";
import { stubJsExecWorker } from "@/test/inProcessJsExecWorker";
import { translate } from "@/i18n/translate";

describe("useJsPlaygroundActions execute output limit", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const renderExecute = (inputJs: string) => {
    const setOutput = vi.fn();
    const setError = vi.fn();
    const toast = { success: vi.fn(), error: vi.fn() };
    const { result } = renderHook(() =>
      useJsPlaygroundActions({
        inputJs,
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
    return { result, setOutput, toast };
  };

  it("caps the console output and ends it with a localized truncation note", async () => {
    stubJsExecWorker();
    const { result, setOutput, toast } = renderExecute(
      `for (let i = 0; i < ${MAX_OUTPUT_LINES + 100}; i++) console.log(i)`,
    );

    act(() => {
      result.current.handleExecute();
    });

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    const output = setOutput.mock.lastCall?.[0] as string;
    const note = translate("messages.js.outputTruncated", {
      lines: MAX_OUTPUT_LINES,
      chars: MAX_OUTPUT_CHARS,
    });
    expect(note).not.toBe("messages.js.outputTruncated");
    expect(output.endsWith(`\n${note}`)).toBe(true);
    expect(output.split("\n")).toHaveLength(MAX_OUTPUT_LINES + 1);
  });

  it("adds no note to output within the limit", async () => {
    stubJsExecWorker();
    const { result, setOutput, toast } = renderExecute("console.log(1)");

    act(() => {
      result.current.handleExecute();
    });

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(setOutput).toHaveBeenLastCalledWith("1");
  });
});
