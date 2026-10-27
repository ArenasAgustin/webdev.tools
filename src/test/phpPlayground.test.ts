import { describe, it, expect, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { usePhpParser } from "@/hooks/usePhpParser";
import { usePhpPlaygroundActions } from "@/hooks/usePhpPlaygroundActions";

vi.mock("@/services/php/phpExecutor", () => ({
  isSharedArrayBufferSupported: () => true,
  executePhpWithTimeout: () =>
    Promise.resolve({
      ok: false,
      error: { message: "Fatal error: Uncaught Error: boom on line 2", output: "before\n" },
    }),
}));

describe("usePhpParser", () => {
  it("reports a syntax error with a single prefix and without parser noise", async () => {
    const { result } = renderHook(() => usePhpParser("<?php\n$a = ;"));

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
    const message = result.current.error?.message ?? "";
    expect(message).toMatch(/^Error de sintaxis en línea 2: /);
    expect(message.match(/sintaxis/gi)).toHaveLength(1);
    expect(message).not.toMatch(/Parse Error|on line \d+$/);
  });
});

describe("usePhpPlaygroundActions execute", () => {
  it("keeps the output printed before a fatal error next to the error", async () => {
    const setOutput = vi.fn();
    const setError = vi.fn();
    const toast = { success: vi.fn(), error: vi.fn() };
    const { result } = renderHook(() =>
      usePhpPlaygroundActions({
        inputPhp: '<?php echo "before\\n"; boom();',
        setInputPhp: vi.fn(),
        output: "",
        setOutput,
        setError,
        formatConfig: {} as never,
        minifyConfig: {},
        toast,
      }),
    );

    act(() => {
      result.current.handleExecute();
    });

    await waitFor(() => {
      expect(setError).toHaveBeenCalledWith("Fatal error: Uncaught Error: boom on line 2");
    });
    expect(setOutput).toHaveBeenLastCalledWith("before\n");
  });
});
