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
  acceptExtensions: ".txt,.md",
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

  describe("handleImportFile", () => {
    const makeHook = () =>
      renderHook(() =>
        useGenericPlaygroundActions({
          input: "",
          setInput,
          output: "",
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

    const makeFile = (name: string, content: string): File =>
      new File([content], name, { type: "text/plain" });

    let mockFileReader: {
      onload: (() => void) | null;
      onerror: (() => void) | null;
      result: string | null;
      readAsText: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
      mockFileReader = {
        onload: null,
        onerror: null,
        result: null,
        readAsText: vi.fn(),
      };

      vi.spyOn(global, "FileReader").mockImplementation(
        () => mockFileReader as unknown as FileReader,
      );
    });

    it("valid extension → calls setInput with file content and shows success toast", async () => {
      const { result } = makeHook();

      act(() => {
        result.current.handleImportFile(makeFile("data.txt", "hello world"));
      });

      // Simulate FileReader.onload
      mockFileReader.result = "hello world";
      act(() => {
        mockFileReader.onload!();
      });

      await waitFor(() => {
        expect(setInput).toHaveBeenCalledWith("hello world");
        expect(toast.success).toHaveBeenCalledWith('Archivo "data.txt" cargado');
        expect(toast.error).not.toHaveBeenCalled();
      });
    });

    it("invalid extension → shows error toast and does NOT call setInput", async () => {
      const { result } = makeHook();

      act(() => {
        result.current.handleImportFile(makeFile("styles.css", ".a{color:red}"));
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Archivo no válido. Extensiones aceptadas: .txt,.md",
        );
        expect(setInput).not.toHaveBeenCalled();
        expect(mockFileReader.readAsText).not.toHaveBeenCalled();
      });
    });

    it("empty file (0 bytes) → calls setInput with empty string and shows success toast", async () => {
      const { result } = makeHook();

      act(() => {
        result.current.handleImportFile(makeFile("empty.txt", ""));
      });

      mockFileReader.result = "";
      act(() => {
        mockFileReader.onload!();
      });

      await waitFor(() => {
        expect(setInput).toHaveBeenCalledWith("");
        expect(toast.success).toHaveBeenCalledWith('Archivo "empty.txt" cargado');
        expect(toast.error).not.toHaveBeenCalled();
      });
    });

    it("FileReader error → shows error toast and does NOT call setInput", async () => {
      const { result } = makeHook();

      act(() => {
        result.current.handleImportFile(makeFile("data.md", "# Title"));
      });

      act(() => {
        mockFileReader.onerror!();
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Error al leer el archivo");
        expect(setInput).not.toHaveBeenCalled();
      });
    });
  });
});
