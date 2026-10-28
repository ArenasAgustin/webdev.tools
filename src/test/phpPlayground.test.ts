import { describe, it, expect, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { usePhpParser } from "@/hooks/usePhpParser";
import { usePhpPlaygroundActions } from "@/hooks/usePhpPlaygroundActions";
import { phpPlaygroundConfig } from "@/playgrounds/php/php.config";

const { executePhpMock } = vi.hoisted(() => ({ executePhpMock: vi.fn() }));

vi.mock("@/services/php/phpExecutor", () => ({
  isSharedArrayBufferSupported: () => true,
  executePhpWithTimeout: executePhpMock,
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
    executePhpMock.mockResolvedValue({
      ok: false,
      error: { message: "Fatal error: Uncaught Error: boom on line 2", output: "before\n" },
    });
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

describe("usePhpPlaygroundActions silent run", () => {
  const run = (value: string) => {
    executePhpMock.mockResolvedValue({ ok: true, value });
    const setOutput = vi.fn();
    const toast = { success: vi.fn(), error: vi.fn() };
    const { result } = renderHook(() =>
      usePhpPlaygroundActions({
        inputPhp: "<?php $a = 1;",
        setInputPhp: vi.fn(),
        output: "",
        setOutput,
        setError: vi.fn(),
        formatConfig: {} as never,
        minifyConfig: {},
        toast,
      }),
    );
    act(() => {
      result.current.handleExecute();
    });
    return { setOutput, toast };
  };

  it("leaves the output empty and says so in the toast when the script prints nothing", async () => {
    const { setOutput, toast } = run("");

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Código PHP ejecutado (sin salida)");
    });
    expect(setOutput).toHaveBeenLastCalledWith("");
  });

  it("keeps the regular success toast when the script prints something", async () => {
    const { setOutput, toast } = run("hi");

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Código PHP ejecutado correctamente");
    });
    expect(setOutput).toHaveBeenLastCalledWith("hi");
  });
});

describe("PHP example", () => {
  it("spells años correctly", () => {
    expect(phpPlaygroundConfig.example).toContain("años");
    expect(phpPlaygroundConfig.example).not.toMatch(/\banos\b/);
  });
});
