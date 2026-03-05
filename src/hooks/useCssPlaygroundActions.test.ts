import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useCssPlaygroundActions } from "./useCssPlaygroundActions";
import { formatCss, minifyCss } from "@/services/css/transform";
import { DEFAULT_CSS_FORMAT_CONFIG, DEFAULT_CSS_MINIFY_CONFIG } from "@/types/css";

vi.mock("@/services/css/transform", () => ({
  formatCss: vi.fn(),
  minifyCss: vi.fn(),
}));

describe("useCssPlaygroundActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("formats CSS and updates output", async () => {
    vi.mocked(formatCss).mockResolvedValue({ ok: true, value: ".card {\n  color: red;\n}" });

    const setInputCss = vi.fn();
    const setOutput = vi.fn();
    const setError = vi.fn();
    const toast = { success: vi.fn(), error: vi.fn() };

    const { result } = renderHook(() =>
      useCssPlaygroundActions({
        inputCss: ".card{color:red}",
        setInputCss,
        output: "",
        setOutput,
        setError,
        formatConfig: DEFAULT_CSS_FORMAT_CONFIG,
        minifyConfig: DEFAULT_CSS_MINIFY_CONFIG,
        toast,
      }),
    );

    act(() => {
      result.current.handleFormat();
    });

    await waitFor(() => {
      expect(formatCss).toHaveBeenCalledWith(".card{color:red}", 2);
      expect(setError).toHaveBeenCalledWith(null);
      expect(setOutput).toHaveBeenCalledWith(".card {\n  color: red;\n}");
      expect(toast.success).toHaveBeenCalledWith("CSS formateado correctamente");
    });
  });

  it("minifies CSS and updates output", async () => {
    vi.mocked(minifyCss).mockResolvedValue({ ok: true, value: ".card{color:red}" });

    const setInputCss = vi.fn();
    const setOutput = vi.fn();
    const setError = vi.fn();
    const toast = { success: vi.fn(), error: vi.fn() };

    const { result } = renderHook(() =>
      useCssPlaygroundActions({
        inputCss: ".card { color: red; }",
        setInputCss,
        output: "",
        setOutput,
        setError,
        formatConfig: DEFAULT_CSS_FORMAT_CONFIG,
        minifyConfig: DEFAULT_CSS_MINIFY_CONFIG,
        toast,
      }),
    );

    act(() => {
      result.current.handleMinify();
    });

    await waitFor(() => {
      expect(minifyCss).toHaveBeenCalledWith(".card { color: red; }", {
        removeComments: true,
        removeSpaces: true,
      });
      expect(setError).toHaveBeenCalledWith(null);
      expect(setOutput).toHaveBeenCalledWith(".card{color:red}");
      expect(toast.success).toHaveBeenCalledWith("CSS minificado correctamente");
    });
  });

  it("blocks actions when input is too large", async () => {
    const setInputCss = vi.fn();
    const setOutput = vi.fn();
    const setError = vi.fn();
    const toast = { success: vi.fn(), error: vi.fn() };

    const { result } = renderHook(() =>
      useCssPlaygroundActions({
        inputCss: ".card{color:red}",
        setInputCss,
        output: "",
        setOutput,
        setError,
        inputTooLarge: true,
        inputTooLargeMessage: "Demasiado grande",
        formatConfig: DEFAULT_CSS_FORMAT_CONFIG,
        minifyConfig: DEFAULT_CSS_MINIFY_CONFIG,
        toast,
      }),
    );

    act(() => {
      result.current.handleMinify();
    });

    await waitFor(() => {
      expect(minifyCss).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("Demasiado grande");
      expect(setError).toHaveBeenCalledWith("Demasiado grande");
    });
  });
});
