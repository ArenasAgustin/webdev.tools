import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const {
  toastMocks,
  storageMocks,
  formatHtmlMock,
  minifyHtmlMock,
  downloadFileMock,
  clipboardWriteTextMock,
} = vi.hoisted(() => ({
  toastMocks: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
  storageMocks: {
    loadLastHtml: vi.fn(() => ""),
    saveLastHtml: vi.fn(),
    loadHtmlToolsConfig: vi.fn(() => null),
    saveHtmlToolsConfig: vi.fn(),
  },
  formatHtmlMock: vi.fn(),
  minifyHtmlMock: vi.fn(),
  downloadFileMock: vi.fn(),
  clipboardWriteTextMock: vi.fn(),
}));

vi.mock("@/hooks/useToast", () => ({
  useToast: () => toastMocks,
}));

vi.mock("@/services/storage", () => storageMocks);

vi.mock("@/hooks/useHtmlParser", () => ({
  useHtmlParser: () => ({ isValid: true, error: null }),
}));

vi.mock("@/services/html/transform", () => ({
  formatHtml: formatHtmlMock as (
    input: string,
    indentSize: number | "\t",
  ) => Promise<{ ok: boolean; value?: string; error?: string }>,
  minifyHtml: minifyHtmlMock as (
    input: string,
    options: unknown,
  ) => {
    ok: boolean;
    value?: string;
    error?: string;
  },
}));

vi.mock("@/utils/download", () => ({
  downloadFile: downloadFileMock as (content: string, filename: string, mimeType: string) => void,
}));

vi.mock("./HtmlEditors", () => ({
  HtmlEditors: ({
    inputHtml,
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
    inputHtml: string;
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
      <p data-testid="input-html">{inputHtml}</p>
      <p data-testid="output-html">{output}</p>
      <p data-testid="error-html">{error}</p>
      <p data-testid="warning">{inputWarning}</p>
      <button onClick={() => onInputChange("<div>ok</div>")}>set-input</button>
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
      onFormatChange: (config: {
        indentSize: number;
        formatCss: boolean;
        formatJs: boolean;
        autoCopy: boolean;
      }) => void;
      onMinifyChange: (config: {
        removeComments: boolean;
        collapseWhitespace: boolean;
        minifyCss: boolean;
        minifyJs: boolean;
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
                formatCss: true,
                formatJs: true,
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
                collapseWhitespace: true,
                minifyCss: true,
                minifyJs: true,
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

import { HtmlPlayground } from "./HtmlPlayground";

describe("HtmlPlayground branches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    formatHtmlMock.mockResolvedValue({ ok: true, value: "<div>formatted</div>" });
    minifyHtmlMock.mockReturnValue({ ok: true, value: "<div>minified</div>" });
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
    render(<HtmlPlayground />);

    fireEvent.click(screen.getByRole("button", { name: "set-empty" }));
    fireEvent.click(screen.getByRole("button", { name: "download-input" }));
    fireEvent.click(screen.getByRole("button", { name: "copy-output" }));
    fireEvent.click(screen.getByRole("button", { name: "download-output" }));

    expect(toastMocks.error).toHaveBeenCalledWith("No hay HTML para descargar");
    expect(toastMocks.error).toHaveBeenCalledWith("No hay resultado para copiar");
    expect(toastMocks.error).toHaveBeenCalledWith("No hay resultado para descargar");

    fireEvent.click(screen.getByRole("button", { name: "set-input" }));
    fireEvent.click(screen.getByRole("button", { name: "download-input" }));
    expect(downloadFileMock).toHaveBeenCalledWith("<div>ok</div>", "index.html", "text/html");

    fireEvent.click(screen.getByRole("button", { name: "Formatear" }));
    await waitFor(() => {
      expect(screen.getByTestId("output-html").textContent).toBe("<div>formatted</div>");
    });

    fireEvent.click(screen.getByRole("button", { name: "copy-output" }));
    fireEvent.click(screen.getByRole("button", { name: "download-output" }));

    await waitFor(() => {
      expect(clipboardWriteTextMock).toHaveBeenCalledWith("<div>formatted</div>");
    });
    expect(downloadFileMock).toHaveBeenCalledWith(
      "<div>formatted</div>",
      "result.html",
      "text/html",
    );
  });

  it("runs format and minify success and error flows", async () => {
    render(<HtmlPlayground />);

    fireEvent.click(screen.getByRole("button", { name: "set-input" }));
    fireEvent.click(screen.getByRole("button", { name: "open-config" }));
    fireEvent.click(screen.getByRole("button", { name: "enable-format-autocopy" }));
    fireEvent.click(screen.getByRole("button", { name: "enable-minify-autocopy" }));

    fireEvent.click(screen.getByRole("button", { name: "Formatear" }));
    await waitFor(() => {
      expect(formatHtmlMock).toHaveBeenCalled();
      expect(toastMocks.success).toHaveBeenCalledWith("HTML formateado correctamente");
      expect(screen.getByTestId("output-html").textContent).toBe("<div>formatted</div>");
    });

    fireEvent.click(screen.getByRole("button", { name: "Minificar" }));
    await waitFor(() => {
      expect(minifyHtmlMock).toHaveBeenCalled();
      expect(toastMocks.success).toHaveBeenCalledWith("HTML minificado correctamente");
      expect(screen.getByTestId("output-html").textContent).toBe("<div>minified</div>");
    });

    formatHtmlMock.mockResolvedValueOnce({ ok: false, error: "format fail" });
    minifyHtmlMock.mockReturnValueOnce({ ok: false, error: "minify fail" });

    fireEvent.click(screen.getByRole("button", { name: "Formatear" }));
    fireEvent.click(screen.getByRole("button", { name: "Minificar" }));

    await waitFor(() => {
      expect(toastMocks.error).toHaveBeenCalledWith("format fail");
      expect(toastMocks.error).toHaveBeenCalledWith("minify fail");
    });
  });

  it("guards operations when input exceeds max size", async () => {
    render(<HtmlPlayground />);

    fireEvent.click(screen.getByRole("button", { name: "set-huge" }));

    await waitFor(() => {
      expect(toastMocks.info).toHaveBeenCalledWith(
        "El contenido supera 500 KB. Algunas operaciones pueden ser lentas.",
      );
    });

    const formatCallsBeforeGuard = formatHtmlMock.mock.calls.length;
    const minifyCallsBeforeGuard = minifyHtmlMock.mock.calls.length;

    fireEvent.click(screen.getByRole("button", { name: "Formatear" }));
    fireEvent.click(screen.getByRole("button", { name: "Minificar" }));

    expect(toastMocks.error).toHaveBeenCalledWith(
      "El contenido supera 500 KB. Reduce el tamano para procesarlo.",
    );
    expect(formatHtmlMock.mock.calls.length).toBe(formatCallsBeforeGuard);
    expect(minifyHtmlMock.mock.calls.length).toBe(minifyCallsBeforeGuard);
  });
});
