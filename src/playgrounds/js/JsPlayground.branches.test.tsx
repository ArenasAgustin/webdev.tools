import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

const {
  toastMocks,
  storageMocks,
  minifyJsAsyncMock,
  formatJsAsyncMock,
  downloadFileMock,
  clipboardWriteTextMock,
} = vi.hoisted(() => ({
  toastMocks: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
  storageMocks: {
    loadLastJs: vi.fn(() => ""),
    saveLastJs: vi.fn(),
    loadJsToolsConfig: vi.fn(() => null),
    saveJsToolsConfig: vi.fn(),
  },
  minifyJsAsyncMock: vi.fn(),
  formatJsAsyncMock: vi.fn(),
  downloadFileMock: vi.fn(),
  clipboardWriteTextMock: vi.fn(),
}));

vi.mock("@/hooks/useToast", () => ({
  useToast: () => toastMocks,
}));

vi.mock("@/services/storage", () => storageMocks);

vi.mock("@/services/js/worker", () => ({
  minifyJsAsync: minifyJsAsyncMock as (
    input: string,
    options: { removeComments: boolean; removeSpaces: boolean },
  ) => Promise<{ ok: boolean; value?: string; error?: { message: string } }>,
  formatJsAsync: formatJsAsyncMock as (
    input: string,
    indentSize: number,
  ) => Promise<{ ok: boolean; value?: string; error?: { message: string } }>,
}));

vi.mock("@/utils/download", () => ({
  downloadFile: downloadFileMock as (content: string, filename: string, mimeType: string) => void,
}));

vi.mock("@/components/editor/GenericEditors", () => ({
  GenericEditors: ({
    input,
    output,
    error,
    validationState,
    inputWarning,
    onInputChange,
    onClearInput,
    onLoadExample,
    onCopyOutput,
    onDownloadInput,
    onDownloadOutput,
  }: {
    input: string;
    output: string;
    error: string | null;
    validationState: { isValid: boolean; error: { message: string } | null };
    inputWarning?: string | null;
    onInputChange: (code: string) => void;
    onClearInput: () => void;
    onLoadExample: () => void;
    onCopyOutput: () => void;
    onDownloadInput: () => void;
    onDownloadOutput: () => void;
  }) => (
    <div>
      <p data-testid="input-code">{input}</p>
      <p data-testid="output-code">{output}</p>
      <p data-testid="error-code">{error}</p>
      <p data-testid="validation-valid">{String(validationState.isValid)}</p>
      <p data-testid="warning">{inputWarning}</p>
      <button onClick={() => onInputChange("return 2")}>set-return</button>
      <button onClick={() => onInputChange('throw new Error("Boom")')}>set-error</button>
      <button onClick={() => onInputChange("const x = 1;")}>set-input</button>
      <button onClick={() => onInputChange("")}>set-empty</button>
      <button onClick={() => onInputChange("x".repeat(500_001))}>set-huge</button>
      <button onClick={onClearInput}>clear-input</button>
      <button onClick={onLoadExample}>load-example</button>
      <button onClick={onCopyOutput}>copy-output</button>
      <button onClick={onDownloadInput}>download-input</button>
      <button onClick={onDownloadOutput}>download-output</button>
    </div>
  ),
}));

vi.mock("@/components/layout/Toolbar", () => ({
  Toolbar: ({
    tools,
    config,
  }: {
    tools: {
      actions: { label: string; onClick: () => void }[];
      onOpenConfig?: () => void;
    };
    config?: {
      onOpenChange?: (isOpen: boolean) => void;
      onFormatChange: (config: { indentSize: number; autoCopy: boolean }) => void;
      onMinifyChange: (config: {
        removeComments: boolean;
        removeSpaces: boolean;
        autoCopy: boolean;
      }) => void;
    };
  }) => (
    <div>
      {tools.actions.map((action) => (
        <button key={action.label} onClick={action.onClick}>
          {action.label}
        </button>
      ))}
      <button onClick={() => (config ? config.onOpenChange?.(true) : tools.onOpenConfig?.())}>
        open-config
      </button>
      {config && (
        <>
          <button onClick={() => config.onFormatChange({ indentSize: 2, autoCopy: true })}>
            enable-format-autocopy
          </button>
          <button
            onClick={() =>
              config.onMinifyChange({
                removeComments: true,
                removeSpaces: true,
                autoCopy: true,
              })
            }
          >
            enable-minify-autocopy
          </button>
        </>
      )}
    </div>
  ),
}));

import { JsPlayground } from "./JsPlayground";

describe("JsPlayground branches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    minifyJsAsyncMock.mockResolvedValue({ ok: true, value: "const x=1;" });
    formatJsAsyncMock.mockResolvedValue({ ok: true, value: "const x = 1;" });
    clipboardWriteTextMock.mockResolvedValue(undefined);

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: clipboardWriteTextMock },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("executes code and handles runtime errors", async () => {
    render(<JsPlayground />);

    fireEvent.click(screen.getByRole("button", { name: "set-return" }));
    fireEvent.click(screen.getByRole("button", { name: "Ejecutar" }));
    await waitFor(() => {
      expect(screen.getByTestId("output-code").textContent).toBe("2");
      expect(toastMocks.success).toHaveBeenCalledWith("Código ejecutado correctamente");
    });

    fireEvent.click(screen.getByRole("button", { name: "set-error" }));
    fireEvent.click(screen.getByRole("button", { name: "Ejecutar" }));
    await waitFor(() => {
      expect(screen.getByTestId("error-code").textContent).toBe("Boom");
      expect(toastMocks.error).toHaveBeenCalledWith("Boom");
    });
  });

  it("handles copy and download input and output branches", async () => {
    render(<JsPlayground />);

    fireEvent.click(screen.getByRole("button", { name: "set-empty" }));
    fireEvent.click(screen.getByRole("button", { name: "download-input" }));
    fireEvent.click(screen.getByRole("button", { name: "copy-output" }));
    fireEvent.click(screen.getByRole("button", { name: "download-output" }));

    expect(toastMocks.error).toHaveBeenCalledWith("No hay Código para descargar");
    expect(toastMocks.error).toHaveBeenCalledWith("No hay resultado para copiar");
    expect(toastMocks.error).toHaveBeenCalledWith("No hay resultado para descargar");

    fireEvent.click(screen.getByRole("button", { name: "set-input" }));
    fireEvent.click(screen.getByRole("button", { name: "download-input" }));
    expect(downloadFileMock).toHaveBeenCalledWith(
      "const x = 1;",
      "code.js",
      "application/javascript",
    );

    fireEvent.click(screen.getByRole("button", { name: "set-return" }));
    fireEvent.click(screen.getByRole("button", { name: "Ejecutar" }));

    await waitFor(() => {
      expect(screen.getByTestId("output-code").textContent).toBe("2");
    });
    await waitFor(() => {
      expect(toastMocks.success).toHaveBeenCalledWith("Código ejecutado correctamente");
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "copy-output" }));
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(clipboardWriteTextMock).toHaveBeenCalledWith("2");
    });

    fireEvent.click(screen.getByRole("button", { name: "download-output" }));
    expect(downloadFileMock).toHaveBeenCalledWith("2", "output.txt", "application/javascript");
  });

  it("runs format and minify success and error flows", async () => {
    render(<JsPlayground />);

    fireEvent.click(screen.getByRole("button", { name: "set-input" }));
    fireEvent.click(screen.getByRole("button", { name: "open-config" }));
    fireEvent.click(screen.getByRole("button", { name: "enable-format-autocopy" }));
    fireEvent.click(screen.getByRole("button", { name: "enable-minify-autocopy" }));

    fireEvent.click(screen.getByRole("button", { name: "Formatear" }));
    await waitFor(() => {
      expect(formatJsAsyncMock).toHaveBeenCalled();
      expect(toastMocks.success).toHaveBeenCalledWith("Código formateado correctamente");
      expect(screen.getByTestId("output-code").textContent).toBe("const x = 1;");
    });

    fireEvent.click(screen.getByRole("button", { name: "Minificar" }));
    await waitFor(() => {
      expect(minifyJsAsyncMock).toHaveBeenCalled();
      expect(toastMocks.success).toHaveBeenCalledWith("Código minificado correctamente");
      expect(screen.getByTestId("output-code").textContent).toBe("const x=1;");
    });

    formatJsAsyncMock.mockResolvedValueOnce({ ok: false, error: { message: "format fail" } });
    minifyJsAsyncMock.mockResolvedValueOnce({ ok: false, error: { message: "minify fail" } });

    fireEvent.click(screen.getByRole("button", { name: "Formatear" }));
    fireEvent.click(screen.getByRole("button", { name: "Minificar" }));

    await waitFor(() => {
      expect(toastMocks.error).toHaveBeenCalledWith("format fail");
      expect(toastMocks.error).toHaveBeenCalledWith("minify fail");
    });
  });

  it("guards operations when input exceeds max size", async () => {
    render(<JsPlayground />);

    fireEvent.click(screen.getByRole("button", { name: "set-huge" }));

    await waitFor(() => {
      expect(toastMocks.info).toHaveBeenCalledWith(
        "El contenido supera 500 KB. Algunas operaciones pueden ser lentas.",
      );
    });

    const formatCallsBeforeGuard = formatJsAsyncMock.mock.calls.length;
    const minifyCallsBeforeGuard = minifyJsAsyncMock.mock.calls.length;

    fireEvent.click(screen.getByRole("button", { name: "Ejecutar" }));
    fireEvent.click(screen.getByRole("button", { name: "Formatear" }));
    fireEvent.click(screen.getByRole("button", { name: "Minificar" }));

    expect(toastMocks.error).toHaveBeenCalledWith(
      "El contenido supera 500 KB. Reduce el tamano para procesarlo.",
    );
    expect(formatJsAsyncMock.mock.calls.length).toBe(formatCallsBeforeGuard);
    expect(minifyJsAsyncMock.mock.calls.length).toBe(minifyCallsBeforeGuard);
  });
});
