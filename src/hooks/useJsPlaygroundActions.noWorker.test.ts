import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useJsPlaygroundActions } from "./useJsPlaygroundActions";

const mocks = vi.hoisted(() => ({ runJavaScript: vi.fn() }));

vi.mock("@/services/js/execute", () => ({ runJavaScript: mocks.runJavaScript }));

const NO_WORKER_MESSAGE =
  "Tu navegador no admite Web Workers: el código no se ejecuta para no bloquear ni exponer la página.";

describe("useJsPlaygroundActions without Worker support", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("refuses to run user code on the main thread", async () => {
    vi.stubGlobal("Worker", undefined);
    const setError = vi.fn();
    const toast = { success: vi.fn(), error: vi.fn() };
    const { result } = renderHook(() =>
      useJsPlaygroundActions({
        inputJs: "console.log(1)",
        setInputJs: vi.fn(),
        output: "",
        setOutput: vi.fn(),
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

    await waitFor(() => expect(setError).toHaveBeenCalledWith(NO_WORKER_MESSAGE));
    expect(mocks.runJavaScript).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });
});
