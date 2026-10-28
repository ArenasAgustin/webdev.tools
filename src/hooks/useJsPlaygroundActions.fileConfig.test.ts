import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useJsPlaygroundActions } from "./useJsPlaygroundActions";
import { jsEngine } from "@/playgrounds/engines/js.engine";
import { downloadFile } from "@/utils/download";

vi.mock("@/utils/download", () => ({ downloadFile: vi.fn() }));

function renderJsActions(output: string) {
  return renderHook(() =>
    useJsPlaygroundActions({
      inputJs: "const a = 1;",
      setInputJs: vi.fn(),
      output,
      setOutput: vi.fn(),
      setError: vi.fn(),
      formatConfig: {} as never,
      minifyConfig: {} as never,
      cleanConfig: {} as never,
      toast: { success: vi.fn(), error: vi.fn() },
    }),
  );
}

describe("useJsPlaygroundActions file settings", () => {
  it("matches the engine's file config", () => {
    const { result } = renderJsActions("");
    expect(result.current.acceptExtensions).toBe(jsEngine.fileConfig.acceptExtensions);
  });

  it("does not accept TypeScript files, which the runner can't execute", () => {
    const { result } = renderJsActions("");
    const accepted = result.current.acceptExtensions.split(",");
    expect(accepted).toContain(".js");
    expect(accepted).not.toContain(".ts");
    expect(accepted).not.toContain(".mts");
  });

  it("downloads input and output with the engine's names and JavaScript mime type", () => {
    const { result } = renderJsActions("const a=1;");

    act(() => result.current.handleDownloadInput());
    act(() => result.current.handleDownloadOutput());

    expect(downloadFile).toHaveBeenCalledWith(
      "const a = 1;",
      jsEngine.fileConfig.inputFileName,
      "text/javascript",
    );
    expect(downloadFile).toHaveBeenCalledWith(
      "const a=1;",
      jsEngine.fileConfig.outputFileName,
      "text/javascript",
    );
  });
});
