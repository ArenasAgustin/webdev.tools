import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ToastApi } from "./usePlaygroundActions";
import { useJsonPlaygroundActions } from "./useJsonPlaygroundActions";
import { formatJsonAsync, minifyJsonAsync, cleanJsonAsync } from "@/services/json/worker";

vi.mock("@/services/json/worker", () => ({
  formatJsonAsync: vi.fn(),
  minifyJsonAsync: vi.fn(),
  cleanJsonAsync: vi.fn(),
  applyJsonPathAsync: vi.fn(),
}));

const PRECISION_WARNING =
  "Algunos números no se pueden representar con exactitud y cambiaron (enteros muy grandes o valores como 1e400).";
const DUPLICATE_WARNING = "Hay claves duplicadas: solo se conservó el último valor de cada una.";

function makeToast() {
  return { success: vi.fn(), error: vi.fn(), info: vi.fn() } satisfies ToastApi;
}

function renderJsonActions(inputJson: string, toast: ToastApi) {
  return renderHook(() =>
    useJsonPlaygroundActions({
      inputJson,
      setInputJson: vi.fn(),
      output: "",
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
}

describe("useJsonPlaygroundActions — silent data changes", () => {
  beforeEach(() => {
    vi.mocked(formatJsonAsync).mockResolvedValue({ ok: true, value: "{}" });
    vi.mocked(minifyJsonAsync).mockResolvedValue({ ok: true, value: "{}" });
    vi.mocked(cleanJsonAsync).mockResolvedValue({ ok: true, value: '{"a": 1}' });
  });

  it("warns when formatting changes a big integer", async () => {
    const toast = makeToast();
    const { result } = renderJsonActions('{"id": 12345678901234567890}', toast);

    act(() => result.current.handleFormat());

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(toast.info).toHaveBeenCalledWith(PRECISION_WARNING);
  });

  it("warns when minifying drops duplicate keys", async () => {
    const toast = makeToast();
    const { result } = renderJsonActions('{"a": 1, "a": 2}', toast);

    act(() => result.current.handleMinify());

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(toast.info).toHaveBeenCalledWith(DUPLICATE_WARNING);
  });

  it("warns when cleaning changes 1e400", async () => {
    const toast = makeToast();
    const { result } = renderJsonActions('{"a": 1, "b": 1e400}', toast);

    act(() => result.current.handleClean());

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(toast.info).toHaveBeenCalledWith(PRECISION_WARNING);
  });

  it("stays quiet for ordinary JSON", async () => {
    const toast = makeToast();
    const { result } = renderJsonActions('{"a": 1}', toast);

    act(() => result.current.handleFormat());

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(toast.info).not.toHaveBeenCalled();
  });
});
