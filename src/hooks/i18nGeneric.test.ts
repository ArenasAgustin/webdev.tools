import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import i18n from "i18next";
import { useGenericPlaygroundActions } from "./useGenericPlaygroundActions";
import { useJsonParser } from "./useJsonParser";
import type { ToastApi } from "./usePlaygroundActions";
import { createValidatedHandler } from "@/utils/handlerFactory";

// Generic hooks and utils translate at call time, so switching the shared i18n
// instance to English must change the messages they emit.
describe("generic hooks i18n (English)", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  afterEach(async () => {
    await i18n.changeLanguage("es");
  });

  it("useGenericPlaygroundActions reports an empty input in English", async () => {
    const toast: ToastApi = { success: vi.fn(), error: vi.fn() };
    const { result } = renderHook(() =>
      useGenericPlaygroundActions({
        input: "",
        setInput: vi.fn(),
        output: "",
        setOutput: vi.fn(),
        setError: vi.fn(),
        formatConfig: { autoCopy: false },
        minifyConfig: { autoCopy: false },
        toast,
        exampleContent: "example",
        fileConfig: {
          inputFileName: "test.txt",
          outputFileName: "output.txt",
          mimeType: "text/plain",
          language: "TestLang",
          acceptExtensions: ".txt",
        },
        formatRunner: vi.fn(),
        minifyRunner: vi.fn(),
      }),
    );

    act(() => {
      result.current.handleFormat();
      result.current.handleUseOutputAsInput();
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("No TestLang to process");
    });
    expect(toast.error).toHaveBeenCalledWith("No output to use as input");
  });

  it("createValidatedHandler falls back to an English error message", () => {
    const toast = { success: vi.fn(), error: vi.fn() };

    createValidatedHandler({ run: () => ({ ok: false }), toast })();
    createValidatedHandler({
      run: () => {
        throw new Error("");
      },
      toast,
    })();

    expect(toast.error).toHaveBeenNthCalledWith(1, "An error occurred");
    expect(toast.error).toHaveBeenNthCalledWith(2, "An error occurred");
  });

  it("parsers prefix syntax errors in English", async () => {
    const { result } = renderHook(() => useJsonParser("{bad"));

    await waitFor(() => {
      expect(result.current.error?.message).toMatch(/^Syntax error: /);
    });
  });
});
