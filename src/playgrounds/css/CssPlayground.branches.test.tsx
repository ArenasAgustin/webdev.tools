import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const {
  toastMocks,
  storageMocks,
  formatCssMock,
  minifyCssMock,
  downloadFileMock,
  clipboardWriteTextMock,
} = vi.hoisted(() => ({
  toastMocks: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
  storageMocks: {
    loadLastCss: vi.fn(() => ""),
    saveLastCss: vi.fn(),
    loadCssToolsConfig: vi.fn(() => null),
    saveCssToolsConfig: vi.fn(),
  },
  formatCssMock: vi.fn(),
  minifyCssMock: vi.fn(),
  downloadFileMock: vi.fn(),
  clipboardWriteTextMock: vi.fn(),
}));

vi.mock("@/hooks/useToast", () => ({
  useToast: () => toastMocks,
}));

vi.mock("@/services/storage", () => storageMocks);

vi.mock("@/hooks/useCssParser", () => ({
  useCssParser: () => ({ isValid: true, error: null }),
}));

vi.mock("@/services/css/service", () => ({
  cssService: {
    format: formatCssMock as (
      input: string,
      options: unknown,
    ) => Promise<{ ok: boolean; value?: string; error?: string }>,
    minify: minifyCssMock as (
      input: string,
      options: unknown,
    ) => Promise<{ ok: boolean; value?: string; error?: string }>,
    validate: vi.fn(),
  },
}));

vi.mock("@/utils/download", () => ({
  downloadFile: downloadFileMock as (content: string, filename: string, mimeType: string) => void,
}));

vi.mock("./CssEditors", () => ({
  CssEditors: ({
    inputCss,
    output,
    error,
    inputWarning,
    onInputChange,
    onClearInput,
    onLoadExample,
    onCopyOutput,
    onDownloadInput,
    onDownloadOutput,
  }: {
    inputCss: string;
    output: string;
    error: string | null;
    inputWarning?: string | null;
    onInputChange: (value: string) => void;
    onClearInput: () => void;
    onLoadExample: () => void;
    onCopyOutput: () => void;
    onDownloadInput: () => void;
    onDownloadOutput: () => void;
  }) => (
    <div>
      <p data-testid="input-css">{inputCss}</p>
      <p data-testid="output-css">{output}</p>
      <p data-testid="error-css">{error}</p>
      <p data-testid="warning">{inputWarning}</p>
      <button onClick={() => onInputChange(".card{color:red}")}>set-input</button>
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
          <button
            onClick={() =>
              config.onFormatChange({
                indentSize: 2,
                autoCopy: true,
              })
            }
          >
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

import { CssPlayground } from "./CssPlayground";

describe("CssPlayground branches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    formatCssMock.mockResolvedValue({ ok: true, value: ".card { color: red; }" });
    minifyCssMock.mockResolvedValue({ ok: true, value: ".card{color:red}" });
    clipboardWriteTextMock.mockResolvedValue(undefined);

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: clipboardWriteTextMock },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("handles copy and download input and output branches", async () => {
    render(<CssPlayground />);

    fireEvent.click(screen.getByRole("button", { name: "set-empty" }));
    fireEvent.click(screen.getByRole("button", { name: "download-input" }));
    fireEvent.click(screen.getByRole("button", { name: "copy-output" }));
    fireEvent.click(screen.getByRole("button", { name: "download-output" }));

    expect(toastMocks.error).toHaveBeenCalledWith("No hay CSS para descargar");
    expect(toastMocks.error).toHaveBeenCalledWith("No hay resultado para copiar");
    expect(toastMocks.error).toHaveBeenCalledWith("No hay resultado para descargar");

    fireEvent.click(screen.getByRole("button", { name: "set-input" }));
    fireEvent.click(screen.getByRole("button", { name: "download-input" }));
    expect(downloadFileMock).toHaveBeenCalledWith(".card{color:red}", "styles.css", "text/css");

    fireEvent.click(screen.getByRole("button", { name: "Formatear" }));
    await waitFor(() => {
      expect(screen.getByTestId("output-css").textContent).toBe(".card { color: red; }");
    });

    fireEvent.click(screen.getByRole("button", { name: "copy-output" }));
    fireEvent.click(screen.getByRole("button", { name: "download-output" }));

    await waitFor(() => {
      expect(clipboardWriteTextMock).toHaveBeenCalledWith(".card { color: red; }");
    });
    expect(downloadFileMock).toHaveBeenCalledWith(
      ".card { color: red; }",
      "result.css",
      "text/css",
    );
  });

  it("runs format and minify success and error flows", async () => {
    render(<CssPlayground />);

    fireEvent.click(screen.getByRole("button", { name: "set-input" }));
    fireEvent.click(screen.getByRole("button", { name: "open-config" }));
    fireEvent.click(screen.getByRole("button", { name: "enable-format-autocopy" }));
    fireEvent.click(screen.getByRole("button", { name: "enable-minify-autocopy" }));

    fireEvent.click(screen.getByRole("button", { name: "Formatear" }));
    await waitFor(() => {
      expect(formatCssMock).toHaveBeenCalled();
      expect(toastMocks.success).toHaveBeenCalledWith("CSS formateado correctamente");
      expect(screen.getByTestId("output-css").textContent).toBe(".card { color: red; }");
    });

    fireEvent.click(screen.getByRole("button", { name: "Minificar" }));
    await waitFor(() => {
      expect(minifyCssMock).toHaveBeenCalled();
      expect(toastMocks.success).toHaveBeenCalledWith("CSS minificado correctamente");
      expect(screen.getByTestId("output-css").textContent).toBe(".card{color:red}");
    });

    formatCssMock.mockResolvedValueOnce({ ok: false, error: "format fail" });
    minifyCssMock.mockResolvedValueOnce({ ok: false, error: "minify fail" });

    fireEvent.click(screen.getByRole("button", { name: "Formatear" }));
    fireEvent.click(screen.getByRole("button", { name: "Minificar" }));

    await waitFor(() => {
      expect(toastMocks.error).toHaveBeenCalledWith("format fail");
      expect(toastMocks.error).toHaveBeenCalledWith("minify fail");
    });
  });

  it("guards operations when input exceeds max size", async () => {
    render(<CssPlayground />);

    fireEvent.click(screen.getByRole("button", { name: "set-huge" }));

    await waitFor(() => {
      expect(toastMocks.info).toHaveBeenCalledWith(
        "El contenido supera 500 KB. Algunas operaciones pueden ser lentas.",
      );
    });

    const formatCallsBeforeGuard = formatCssMock.mock.calls.length;
    const minifyCallsBeforeGuard = minifyCssMock.mock.calls.length;

    fireEvent.click(screen.getByRole("button", { name: "Formatear" }));
    fireEvent.click(screen.getByRole("button", { name: "Minificar" }));

    expect(toastMocks.error).toHaveBeenCalledWith(
      "El contenido supera 500 KB. Reduce el tamano para procesarlo.",
    );
    expect(formatCssMock.mock.calls.length).toBe(formatCallsBeforeGuard);
    expect(minifyCssMock.mock.calls.length).toBe(minifyCallsBeforeGuard);
  });
});
