import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useJsPlaygroundActions } from "./useJsPlaygroundActions";
import { MAX_OUTPUT_CHARS, MAX_OUTPUT_LINES } from "@/services/js/execute";
import type { JsExecRequest, JsExecResponse } from "@/services/js/execute";
import { InProcessJsExecWorker, stubJsExecWorker } from "@/test/inProcessJsExecWorker";
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

  it("ignores a malformed message user code posts and finishes with the real result", async () => {
    // User code can call the worker's own postMessage, e.g. postMessage({ type: "done" }).
    class SpoofingWorker extends InProcessJsExecWorker {
      postMessage(request: JsExecRequest) {
        for (const data of [{ type: "done" }, null, { type: "log", line: 1 }]) {
          try {
            this.onmessage?.({ data } as MessageEvent<JsExecResponse>);
          } catch {
            // A throwing handler is only reported by the browser; the worker keeps going.
          }
        }
        super.postMessage(request);
      }
    }
    vi.stubGlobal("Worker", SpoofingWorker);
    const { result, setOutput, toast } = renderExecute('console.log("real")');

    act(() => {
      result.current.handleExecute();
    });

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(setOutput).toHaveBeenLastCalledWith("real");
  });
});
