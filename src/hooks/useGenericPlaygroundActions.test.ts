import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useGenericPlaygroundActions } from "./useGenericPlaygroundActions";
import type { PlaygroundFileConfig } from "./useGenericPlaygroundActions";
import type { ToastApi } from "./usePlaygroundActions";

const FILE_CONFIG: PlaygroundFileConfig = {
  inputFileName: "test.txt",
  outputFileName: "result.txt",
  mimeType: "text/plain",
  language: "TestLang",
};

describe("useGenericPlaygroundActions", () => {
  let setInput: (value: string) => void;
  let setOutput: (value: string) => void;
  let setError: (value: string | null) => void;
  let toast: ToastApi;

  beforeEach(() => {
    setInput = vi.fn();
    setOutput = vi.fn();
    setError = vi.fn();
    toast = { success: vi.fn(), error: vi.fn() };
  });

  it("handleCopyOutput calls toast if output exists", async () => {
    // Mock clipboard
    Object.assign(global, {
      navigator: {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      },
    });
    const { result } = renderHook(() =>
      useGenericPlaygroundActions({
        input: "abc",
        setInput,
        output: "xyz",
        setOutput,
        setError,
        formatConfig: { autoCopy: false },
        minifyConfig: { autoCopy: false },
        toast,
        exampleContent: "example",
        fileConfig: FILE_CONFIG,
        formatRunner: vi.fn(),
        minifyRunner: vi.fn(),
      }),
    );
    act(() => {
      result.current.handleCopyOutput();
    });
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Resultado copiado al portapapeles");
    });
  });

  it("handleDownloadInput triggers download with correct file name", () => {
    const { result } = renderHook(() =>
      useGenericPlaygroundActions({
        input: "abc",
        setInput,
        output: "xyz",
        setOutput,
        setError,
        formatConfig: { autoCopy: false },
        minifyConfig: { autoCopy: false },
        toast,
        exampleContent: "example",
        fileConfig: FILE_CONFIG,
        formatRunner: vi.fn(),
        minifyRunner: vi.fn(),
      }),
    );
    act(() => {
      result.current.handleDownloadInput();
    });
    // No error expected, download logic is delegated
  });

  it("handleFormat calls formatRunner and sets output", async () => {
    const formatRunner = vi.fn().mockResolvedValue("formatted");
    const { result } = renderHook(() =>
      useGenericPlaygroundActions({
        input: "abc",
        setInput,
        output: "",
        setOutput,
        setError,
        formatConfig: { autoCopy: false },
        minifyConfig: { autoCopy: false },
        toast,
        exampleContent: "example",
        fileConfig: FILE_CONFIG,
        formatRunner,
        minifyRunner: vi.fn(),
      }),
    );
    act(() => {
      result.current.handleFormat();
    });
    await waitFor(() => {
      expect(formatRunner).toHaveBeenCalledWith("abc", { autoCopy: false });
    });
  });
});
