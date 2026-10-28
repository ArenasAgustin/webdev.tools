import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ToastApi } from "./usePlaygroundActions";
import { useJsonPlaygroundActions } from "./useJsonPlaygroundActions";

vi.mock("@/services/json/worker", () => ({
  formatJsonAsync: vi.fn(),
  minifyJsonAsync: vi.fn(),
  cleanJsonAsync: vi.fn(),
  applyJsonPathAsync: vi.fn(),
}));

describe("useJsonPlaygroundActions — copy output", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("copies the output with LF line endings", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const toast = { success: vi.fn(), error: vi.fn() } satisfies ToastApi;

    const { result } = renderHook(() =>
      useJsonPlaygroundActions({
        inputJson: "",
        setInputJson: vi.fn(),
        output: '{\r\n  "a": 1\r\n}',
        setOutput: vi.fn(),
        setError: vi.fn(),
        jsonPathExpression: "",
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
        toast,
      }),
    );

    act(() => result.current.handleCopyOutput());

    await waitFor(() => expect(writeText).toHaveBeenCalled());
    expect(writeText).toHaveBeenCalledWith('{\n  "a": 1\n}');
  });
});
