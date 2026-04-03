import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const {
  toastMocks,
  storageMocks,
  formatJsonMock,
  minifyJsonMock,
  cleanJsonMock,
  applyJsonPathMock,
  downloadFileMock,
  clipboardWriteTextMock,
} = vi.hoisted(() => ({
  toastMocks: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
  storageMocks: {
    loadLastJson: vi.fn(() => ""),
    saveLastJson: vi.fn(),
    loadJsonToolsConfig: vi.fn(() => null),
    saveJsonToolsConfig: vi.fn(),
    STORAGE_KEYS: {
      JSON_TOOLS_CONFIG: "jsonToolsConfig",
      LAST_JSON: "lastJson",
      JSONPATH_HISTORY: "jsonPathHistory",
    },
    getItem: vi.fn(() => null),
    removeItem: vi.fn(),
  },
  formatJsonMock: vi.fn(),
  minifyJsonMock: vi.fn(),
  cleanJsonMock: vi.fn(),
  applyJsonPathMock: vi.fn(),
  downloadFileMock: vi.fn(),
  clipboardWriteTextMock: vi.fn(),
}));

vi.mock("@/hooks/useToast", () => ({
  useToast: () => toastMocks,
}));

vi.mock("@/services/storage", () => storageMocks);

vi.mock("@/hooks/useJsonParser", () => ({
  useJsonParser: () => ({ isValid: true, error: null }),
}));

vi.mock("@/services/json/worker", () => ({
  formatJsonAsync: formatJsonMock as (
    input: string,
    options: unknown,
  ) => Promise<{ ok: boolean; value?: string; error?: { message: string } }>,
  minifyJsonAsync: minifyJsonMock as (
    input: string,
    options: unknown,
  ) => Promise<{ ok: boolean; value?: string; error?: { message: string } }>,
  cleanJsonAsync: cleanJsonMock as (
    input: string,
    options: unknown,
  ) => Promise<{ ok: boolean; value?: string; error?: { message: string } }>,
  applyJsonPathAsync: applyJsonPathMock as (
    input: string,
    path: string,
  ) => Promise<{ ok: boolean; value?: string; error?: { message: string } }>,
}));

vi.mock("@/utils/download", () => ({
  downloadFile: downloadFileMock as (content: string, filename: string, mimeType: string) => void,
}));

vi.mock("@/hooks/useJsonPathHistory", () => ({
  useJsonPathHistory: () => ({
    history: [{ id: "hist-1", expression: "$.users" }],
    addToHistory: vi.fn(),
    removeFromHistory: vi.fn(),
    clearHistory: vi.fn(),
  }),
}));

vi.mock("@/components/editor/GenericEditors", () => ({
  GenericEditors: ({
    input,
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
    input: string;
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
      <p data-testid="input-json">{input}</p>
      <p data-testid="output-json">{output}</p>
      <p data-testid="error-json">{error}</p>
      <p data-testid="warning">{inputWarning}</p>
      <button onClick={() => onInputChange('{"key":"value"}')}>set-input</button>
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
    extraContent,
  }: {
    tools: {
      actions: {
        label: string;
        onClick: () => void;
      }[];
    };
    config?: {
      onOpenChange?: (isOpen: boolean) => void;
      onFormatChange: (config: {
        indentSize: number;
        sortKeys: boolean;
        autoCopy: boolean;
      }) => void;
      onMinifyChange: (config: {
        removeSpaces: boolean;
        sortKeys: boolean;
        autoCopy: boolean;
      }) => void;
      onCleanChange: (config: {
        removeNull: boolean;
        removeUndefined: boolean;
        removeEmptyString: boolean;
        removeEmptyArray: boolean;
        removeEmptyObject: boolean;
        outputFormat: string;
        autoCopy: boolean;
      }) => void;
    };
    extraContent?: React.ReactNode;
  }) => (
    <div>
      {tools.actions.map((action) => (
        <button key={action.label} onClick={action.onClick}>
          {action.label}
        </button>
      ))}
      <button onClick={() => config?.onOpenChange?.(true)}>open-config</button>
      {config && (
        <>
          <button
            onClick={() =>
              config.onFormatChange({
                indentSize: 2,
                sortKeys: false,
                autoCopy: true,
              })
            }
          >
            enable-format-autocopy
          </button>
          <button
            onClick={() =>
              config.onMinifyChange({
                removeSpaces: true,
                sortKeys: false,
                autoCopy: true,
              })
            }
          >
            enable-minify-autocopy
          </button>
        </>
      )}
      {extraContent}
    </div>
  ),
}));

import { JsonPlayground } from "./JsonPlayground";

describe("JsonPlayground branches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    formatJsonMock.mockResolvedValue({ ok: true, value: '{\n  "formatted": true\n}' });
    minifyJsonMock.mockResolvedValue({ ok: true, value: '{"minified":true}' });
    cleanJsonMock.mockResolvedValue({ ok: true, value: '{"cleaned":true}' });
    applyJsonPathMock.mockResolvedValue({ ok: true, value: '["result"]' });
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
    render(<JsonPlayground />);

    fireEvent.click(screen.getByRole("button", { name: "set-empty" }));
    fireEvent.click(screen.getByRole("button", { name: "download-input" }));
    fireEvent.click(screen.getByRole("button", { name: "copy-output" }));
    fireEvent.click(screen.getByRole("button", { name: "download-output" }));

    expect(toastMocks.error).toHaveBeenCalledWith("No hay JSON para descargar");
    expect(toastMocks.error).toHaveBeenCalledWith("No hay resultado para copiar");
    expect(toastMocks.error).toHaveBeenCalledWith("No hay resultado para descargar");

    fireEvent.click(screen.getByRole("button", { name: "set-input" }));
    fireEvent.click(screen.getByRole("button", { name: "download-input" }));
    expect(downloadFileMock).toHaveBeenCalledWith(
      '{"key":"value"}',
      "data.json",
      "application/json",
    );

    fireEvent.click(screen.getByRole("button", { name: "Formatear" }));
    await waitFor(() => {
      expect(screen.getByTestId("output-json").textContent).toBe('{\n  "formatted": true\n}');
    });

    fireEvent.click(screen.getByRole("button", { name: "copy-output" }));

    await waitFor(() => {
      expect(clipboardWriteTextMock).toHaveBeenCalledWith('{\n  "formatted": true\n}');
    });

    fireEvent.click(screen.getByRole("button", { name: "download-output" }));
    expect(downloadFileMock).toHaveBeenCalledWith(
      '{\n  "formatted": true\n}',
      "result.json",
      "application/json",
    );
  });

  it("runs format, minify and clean success and error flows", async () => {
    render(<JsonPlayground />);

    fireEvent.click(screen.getByRole("button", { name: "set-input" }));
    fireEvent.click(screen.getByRole("button", { name: "open-config" }));
    fireEvent.click(screen.getByRole("button", { name: "enable-format-autocopy" }));
    fireEvent.click(screen.getByRole("button", { name: "enable-minify-autocopy" }));

    fireEvent.click(screen.getByRole("button", { name: "Formatear" }));
    await waitFor(() => {
      expect(formatJsonMock).toHaveBeenCalled();
      expect(toastMocks.success).toHaveBeenCalledWith("JSON formateado correctamente");
      expect(screen.getByTestId("output-json").textContent).toBe('{\n  "formatted": true\n}');
    });

    fireEvent.click(screen.getByRole("button", { name: "Minificar" }));
    await waitFor(() => {
      expect(minifyJsonMock).toHaveBeenCalled();
      expect(toastMocks.success).toHaveBeenCalledWith("JSON minificado correctamente");
      expect(screen.getByTestId("output-json").textContent).toBe('{"minified":true}');
    });

    fireEvent.click(screen.getByRole("button", { name: "Limpiar vacíos" }));
    await waitFor(() => {
      expect(cleanJsonMock).toHaveBeenCalled();
      expect(toastMocks.success).toHaveBeenCalledWith("JSON limpiado correctamente");
      expect(screen.getByTestId("output-json").textContent).toBe('{"cleaned":true}');
    });

    formatJsonMock.mockResolvedValueOnce({ ok: false, error: { message: "format fail" } });
    minifyJsonMock.mockResolvedValueOnce({ ok: false, error: { message: "minify fail" } });

    fireEvent.click(screen.getByRole("button", { name: "Formatear" }));
    fireEvent.click(screen.getByRole("button", { name: "Minificar" }));

    await waitFor(() => {
      expect(toastMocks.error).toHaveBeenCalledWith("format fail");
      expect(toastMocks.error).toHaveBeenCalledWith("minify fail");
    });
  });

  it("updates jsonPath expression on input change", () => {
    render(<JsonPlayground />);

    const input = screen.getByLabelText("Expresion JSONPath");
    fireEvent.change(input, { target: { value: "$.name" } });

    expect((input as HTMLInputElement).value).toBe("$.name");
  });

  it("tries a quick example from TipsModal and closes modal", async () => {
    render(<JsonPlayground />);

    fireEvent.click(screen.getByRole("button", { name: "Ver tips de filtros" }));

    // Quick example buttons contain both label and description — find by textContent
    await waitFor(() => {
      const quickBtn = screen
        .getAllByRole("button")
        .find((b) => b.textContent?.includes("$.users"));
      expect(quickBtn).toBeDefined();
      fireEvent.click(quickBtn!);
    });

    await waitFor(() => {
      expect(screen.getByLabelText("Expresion JSONPath")).toHaveValue("$.users");
    });
  });

  it("reuses an expression from JsonPathHistoryModal and closes modal", async () => {
    render(<JsonPlayground />);

    fireEvent.click(screen.getByRole("button", { name: "Historial de filtros" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Reutilizar filtro")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("Reutilizar filtro"));

    await waitFor(() => {
      expect(screen.getByLabelText("Expresion JSONPath")).toHaveValue("$.users");
    });
  });

  it("guards operations when input exceeds max size", async () => {
    render(<JsonPlayground />);

    fireEvent.click(screen.getByRole("button", { name: "set-huge" }));

    await waitFor(() => {
      expect(toastMocks.info).toHaveBeenCalledWith(
        "El contenido supera 500 KB. Algunas operaciones pueden ser lentas.",
      );
    });

    const formatCallsBeforeGuard = formatJsonMock.mock.calls.length;
    const minifyCallsBeforeGuard = minifyJsonMock.mock.calls.length;

    fireEvent.click(screen.getByRole("button", { name: "Formatear" }));
    fireEvent.click(screen.getByRole("button", { name: "Minificar" }));

    expect(toastMocks.error).toHaveBeenCalledWith(
      "El contenido supera 500 KB. Reduce el tamano para procesarlo.",
    );
    expect(formatJsonMock.mock.calls.length).toBe(formatCallsBeforeGuard);
    expect(minifyJsonMock.mock.calls.length).toBe(minifyCallsBeforeGuard);
  });
});
