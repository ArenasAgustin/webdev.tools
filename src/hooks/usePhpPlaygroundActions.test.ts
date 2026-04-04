import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePhpPlaygroundActions } from "./usePhpPlaygroundActions";
import { DEFAULT_PHP_FORMAT_CONFIG } from "@/types/php";

vi.mock("@/services/php/service", () => ({
  phpService: {
    format: vi.fn(),
  },
}));

function makeHook(inputPhp = "") {
  const setInputPhp = vi.fn();
  const setOutput = vi.fn();
  const setError = vi.fn();
  const toast = { success: vi.fn(), error: vi.fn() };

  const result = renderHook(() =>
    usePhpPlaygroundActions({
      inputPhp,
      setInputPhp,
      output: "",
      setOutput,
      setError,
      formatConfig: DEFAULT_PHP_FORMAT_CONFIG,
      minifyConfig: { autoCopy: false },
      toast,
    }),
  );

  return { ...result, mocks: { setInputPhp, setOutput, setError, toast } };
}

describe("usePhpPlaygroundActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handleFormat", () => {
    it("calls phpService.format with input and indentSize and sets output on success", async () => {
      const { phpService } = await import("@/services/php/service");
      vi.mocked(phpService.format).mockResolvedValue({
        ok: true,
        value: "<?php\n\necho 'hello';",
      });

      const { result, mocks } = makeHook("<?php echo 'hello';");

      act(() => {
        result.current.handleFormat();
      });

      await vi.waitFor(() => {
        expect(mocks.setOutput).toHaveBeenCalledWith("<?php\n\necho 'hello';");
      });

      expect(phpService.format).toHaveBeenCalledWith("<?php echo 'hello';", {
        indentSize: 2,
      });
    });

    it("sets error when format fails", async () => {
      const { phpService } = await import("@/services/php/service");
      vi.mocked(phpService.format).mockResolvedValue({
        ok: false,
        error: "Syntax error on line 3",
      });

      const { result, mocks } = makeHook("<?php invalid code");

      act(() => {
        result.current.handleFormat();
      });

      await vi.waitFor(() => {
        expect(mocks.setError).toHaveBeenCalledWith("Syntax error on line 3");
      });
    });
  });

  describe("base actions", () => {
    it("provides handleClearInput that clears input", () => {
      const { result, mocks } = makeHook("some php code");

      act(() => {
        result.current.handleClearInput();
      });

      expect(mocks.setInputPhp).toHaveBeenCalledWith("");
    });

    it("provides handleLoadExample that loads example content", () => {
      const { result, mocks } = makeHook();

      act(() => {
        result.current.handleLoadExample();
      });

      expect(mocks.setInputPhp).toHaveBeenCalledWith(expect.stringContaining("<?php"));
    });
  });
});
