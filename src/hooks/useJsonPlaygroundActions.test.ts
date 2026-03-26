import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useJsonPlaygroundActions } from "./useJsonPlaygroundActions";
import {
  DEFAULT_JSON_FORMAT_CONFIG,
  DEFAULT_JSON_MINIFY_CONFIG,
  DEFAULT_JSON_CLEAN_CONFIG,
} from "@/types/json";

vi.mock("@/services/json/worker", () => ({
  formatJsonAsync: vi.fn(),
  minifyJsonAsync: vi.fn(),
  cleanJsonAsync: vi.fn(),
  applyJsonPathAsync: vi.fn(),
}));

// Import mocked functions after vi.mock
import { cleanJsonAsync, applyJsonPathAsync } from "@/services/json/worker";

const VALID_JSON = '{"name":"Juan","age":28,"emptyStr":"","nullVal":null}';

function makeHook(
  overrides: {
    inputJson?: string;
    jsonPathExpression?: string;
  } = {},
) {
  const setInputJson = vi.fn();
  const setOutput = vi.fn();
  const setError = vi.fn();
  const setJsonPathExpression = vi.fn();
  const addToHistory = vi.fn().mockResolvedValue(undefined);
  const toast = { success: vi.fn(), error: vi.fn() };

  const result = renderHook(() =>
    useJsonPlaygroundActions({
      inputJson: overrides.inputJson ?? VALID_JSON,
      setInputJson,
      output: "",
      setOutput,
      setError,
      jsonPathExpression: overrides.jsonPathExpression ?? "$.name",
      setJsonPathExpression,
      addToHistory,
      formatConfig: DEFAULT_JSON_FORMAT_CONFIG,
      minifyConfig: DEFAULT_JSON_MINIFY_CONFIG,
      cleanConfig: DEFAULT_JSON_CLEAN_CONFIG,
      toast,
    }),
  );

  return {
    ...result,
    mocks: { setInputJson, setOutput, setError, setJsonPathExpression, addToHistory, toast },
  };
}

describe("useJsonPlaygroundActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handleClean", () => {
    it("removes nulls and empty strings and sets output on success", async () => {
      const cleanedJson = '{"name":"Juan","age":28}';
      vi.mocked(cleanJsonAsync).mockResolvedValue({ ok: true, value: cleanedJson });

      const { result, mocks } = makeHook();

      act(() => {
        result.current.handleClean();
      });

      await waitFor(() => {
        expect(cleanJsonAsync).toHaveBeenCalledWith(
          VALID_JSON,
          expect.objectContaining({
            removeNull: DEFAULT_JSON_CLEAN_CONFIG.removeNull,
            removeEmptyString: DEFAULT_JSON_CLEAN_CONFIG.removeEmptyString,
          }),
        );
        expect(mocks.setError).toHaveBeenCalledWith(null);
        expect(mocks.setOutput).toHaveBeenCalledWith(cleanedJson);
      });
    });

    it("sets error when cleanJsonAsync returns not ok", async () => {
      vi.mocked(cleanJsonAsync).mockResolvedValue({
        ok: false,
        error: { message: "JSON inválido" },
      });

      const { result, mocks } = makeHook();

      act(() => {
        result.current.handleClean();
      });

      await waitFor(() => {
        expect(mocks.setOutput).not.toHaveBeenCalled();
        expect(mocks.setError).toHaveBeenCalled();
      });
    });

    it("sets error when cleaned result is empty", async () => {
      vi.mocked(cleanJsonAsync).mockResolvedValue({ ok: true, value: "   " });

      const { result, mocks } = makeHook();

      act(() => {
        result.current.handleClean();
      });

      await waitFor(() => {
        expect(mocks.setError).toHaveBeenCalled();
        expect(mocks.setOutput).not.toHaveBeenCalledWith(expect.stringContaining("Juan"));
      });
    });
  });

  describe("handleApplyJsonPath", () => {
    it("does nothing (shows error) when expression is blank", async () => {
      const { result, mocks } = makeHook({ jsonPathExpression: "   " });

      act(() => {
        result.current.handleApplyJsonPath();
      });

      await waitFor(() => {
        expect(applyJsonPathAsync).not.toHaveBeenCalled();
        expect(mocks.setError).toHaveBeenCalled();
      });
    });

    it("sets output to '[]' and sets warning when expression has no match", async () => {
      vi.mocked(applyJsonPathAsync).mockResolvedValue({ ok: true, value: "[]" });

      const { result, mocks } = makeHook({ jsonPathExpression: "$.nonexistent" });

      act(() => {
        result.current.handleApplyJsonPath();
      });

      await waitFor(() => {
        expect(mocks.setOutput).toHaveBeenCalledWith("[]");
        expect(mocks.setError).toHaveBeenCalledWith("El filtro no devolvió resultados");
      });
    });

    it("sets output and clears error when expression has a match", async () => {
      vi.mocked(applyJsonPathAsync).mockResolvedValue({ ok: true, value: '"Juan"' });

      const { result, mocks } = makeHook({ jsonPathExpression: "$.name" });

      act(() => {
        result.current.handleApplyJsonPath();
      });

      await waitFor(() => {
        expect(mocks.setOutput).toHaveBeenCalledWith('"Juan"');
        expect(mocks.setError).toHaveBeenCalledWith(null);
        expect(mocks.addToHistory).toHaveBeenCalledWith("$.name");
      });
    });

    it("calls setError when applyJsonPathAsync returns not ok", async () => {
      vi.mocked(applyJsonPathAsync).mockResolvedValue({
        ok: false,
        error: { message: "Expresión inválida" },
      });

      const { result, mocks } = makeHook({ jsonPathExpression: "$.name" });

      act(() => {
        result.current.handleApplyJsonPath();
      });

      await waitFor(() => {
        expect(mocks.setError).toHaveBeenCalled();
        expect(mocks.setOutput).not.toHaveBeenCalled();
      });
    });
  });

  describe("handleReuseFromHistory", () => {
    it("sets the expression and applies it writing output", async () => {
      vi.mocked(applyJsonPathAsync).mockResolvedValue({ ok: true, value: '"Juan"' });

      const { result, mocks } = makeHook();

      act(() => {
        result.current.handleReuseFromHistory("$.name");
      });

      await waitFor(() => {
        expect(mocks.setJsonPathExpression).toHaveBeenCalledWith("$.name");
        expect(applyJsonPathAsync).toHaveBeenCalledWith(VALID_JSON, "$.name");
        expect(mocks.setOutput).toHaveBeenCalledWith('"Juan"');
        expect(mocks.setError).toHaveBeenCalledWith(null);
        expect(mocks.addToHistory).toHaveBeenCalledWith("$.name");
      });
    });

    it("sets output to '[]' and sets warning when expression returns empty", async () => {
      vi.mocked(applyJsonPathAsync).mockResolvedValue({ ok: true, value: "[]" });

      const { result, mocks } = makeHook();

      act(() => {
        result.current.handleReuseFromHistory("$.missing");
      });

      await waitFor(() => {
        expect(mocks.setJsonPathExpression).toHaveBeenCalledWith("$.missing");
        expect(mocks.setOutput).toHaveBeenCalledWith("[]");
        expect(mocks.setError).toHaveBeenCalledWith("El filtro no devolvió resultados");
      });
    });
  });
});
