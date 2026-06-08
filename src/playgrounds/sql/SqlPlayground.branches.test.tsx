import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import type { SqlExecuteResult } from "@/types/sql";
import { MAX_INPUT_BYTES } from "@/utils/constants/limits";

const {
  toastMocks,
  storageMocks,
  formatSqlAsyncMock,
  minifySqlAsyncMock,
  executeSqlAsyncMock,
  resetSqlAsyncMock,
  validateSqlAsyncMock,
  downloadFileMock,
  clipboardWriteTextMock,
} = vi.hoisted(() => ({
  toastMocks: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
  storageMocks: {
    loadLastSql: vi.fn(() => ""),
    saveLastSql: vi.fn(),
    loadSqlToolsConfig: vi.fn(() => null),
    saveSqlToolsConfig: vi.fn(),
    // Other storage mocks needed by GenericPlayground setup
    loadLastJson: vi.fn(() => null),
    loadLastJs: vi.fn(() => null),
    loadLastHtml: vi.fn(() => null),
    loadLastCss: vi.fn(() => null),
    loadLastPhp: vi.fn(() => null),
    loadJsonToolsConfig: vi.fn(() => null),
    loadJsToolsConfig: vi.fn(() => null),
    loadHtmlToolsConfig: vi.fn(() => null),
    loadCssToolsConfig: vi.fn(() => null),
    loadPhpToolsConfig: vi.fn(() => null),
  },
  formatSqlAsyncMock: vi.fn<(input: string) => Promise<{ ok: boolean; value?: string; error?: string }>>(),
  minifySqlAsyncMock: vi.fn<(input: string) => Promise<{ ok: boolean; value?: string; error?: string }>>(),
  executeSqlAsyncMock: vi.fn<(input: string) => Promise<{ ok: boolean; value?: SqlExecuteResult; error?: string }>>(),
  resetSqlAsyncMock: vi.fn<() => Promise<{ ok: boolean; value?: string; error?: string }>>(),
  validateSqlAsyncMock: vi.fn<(input: string) => Promise<{ ok: boolean; error?: string }>>(),
  downloadFileMock: vi.fn(),
  clipboardWriteTextMock: vi.fn(),
}));

vi.mock("@/hooks/useToast", () => ({
  useToast: () => toastMocks,
}));

vi.mock("@/services/storage", () => storageMocks);

vi.mock("@/services/sql/worker", () => ({
  formatSqlAsync: formatSqlAsyncMock,
  minifySqlAsync: minifySqlAsyncMock,
  executeSqlAsync: executeSqlAsyncMock,
  resetSqlAsync: resetSqlAsyncMock,
  validateSqlAsync: validateSqlAsyncMock,
}));

vi.mock("@/utils/download", () => ({
  downloadFile: downloadFileMock,
}));

vi.mock("@/components/editor/GenericEditors", () => ({
  GenericEditors: ({
    input,
    output,
    error,
    onInputChange,
    onClearInput,
    onLoadExample,
    onCopyOutput,
    onDownloadInput,
    onDownloadOutput,
    outputPanel,
  }: {
    input: string;
    output: string;
    error: string | null;
    onInputChange: (code: string) => void;
    onClearInput: () => void;
    onLoadExample: () => void;
    onCopyOutput: () => void;
    onDownloadInput: () => void;
    onDownloadOutput: () => void;
    outputPanel?: (props: {
      input: string;
      output: string;
      error: string | null;
      outputStats: { lines: number; characters: number; bytes: number };
      comparisonBytes: number;
      expandOutput: () => void;
      onCopyOutput: () => void;
      onDownloadOutput: () => void;
      onUseOutputAsInput?: () => void;
    }) => React.ReactNode;
  }) => (
    <div>
      <p data-testid="input-code">{input}</p>
      <p data-testid="output-code">{output}</p>
      <p data-testid="error-code">{error}</p>
      <button onClick={() => onInputChange("SELECT * FROM users")}>set-input</button>
      <button onClick={() => onInputChange("")}>set-empty</button>
      <button onClick={() => onInputChange("x".repeat(MAX_INPUT_BYTES + 1))}>set-huge</button>
      <button onClick={onClearInput}>clear-input</button>
      <button onClick={onLoadExample}>load-example</button>
      <button onClick={onCopyOutput}>copy-output</button>
      <button onClick={onDownloadInput}>download-input</button>
      <button onClick={onDownloadOutput}>download-output</button>
      {outputPanel?.({
        input,
        output,
        error,
        outputStats: { lines: 0, characters: 0, bytes: 0 },
        comparisonBytes: 0,
        expandOutput: () => {},
        onCopyOutput,
        onDownloadOutput,
      })}
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
      onFormatChange: (config: object) => void;
      onMinifyChange: (config: object) => void;
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
    </div>
  ),
}));

// Mock LazyCodeEditor, Panel, OutputActions, EditorFooter to simplify test DOM
vi.mock("@/components/editor/LazyCodeEditor", () => ({
  LazyCodeEditor: ({ value, language }: { value: string; language: string }) => (
    <div data-testid={`code-editor-${language}`}>{value}</div>
  ),
}));

vi.mock("@/components/layout/Panel", () => ({
  Panel: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
    [key: string]: unknown;
  }) => (
    <div data-testid={`panel-${title.toLowerCase().replace(/\s/g, "-")}`}>
      <span>{title}</span>
      {children}
    </div>
  ),
}));

vi.mock("@/components/editor/OutputActions", () => ({
  OutputActions: () => <div data-testid="output-actions" />,
}));

vi.mock("@/components/common/EditorFooter", () => ({
  EditorFooter: () => <div data-testid="editor-footer" />,
}));

import React from "react";
import { SqlPlayground } from "./SqlPlayground";

describe("SqlPlayground branches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    formatSqlAsyncMock.mockResolvedValue({ ok: true, value: "SELECT *\nFROM users" });
    minifySqlAsyncMock.mockResolvedValue({ ok: true, value: "SELECT * FROM users" });
    executeSqlAsyncMock.mockResolvedValue({
      ok: true,
      value: {
        columns: ["id", "name"],
        rows: [[1, "Alice"]],
        elapsedMs: 5,
        truncated: false,
      },
    });
    resetSqlAsyncMock.mockResolvedValue({ ok: true, value: "reset" });
    validateSqlAsyncMock.mockResolvedValue({ ok: true });
    clipboardWriteTextMock.mockResolvedValue(undefined);

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: clipboardWriteTextMock },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders the SQL playground with idle output panel when no query has been run", () => {
    render(<SqlPlayground />);
    expect(screen.getByText("editor.outputIdle")).toBeInTheDocument();
  });

  it("format success → output updated", async () => {
    vi.useFakeTimers();
    render(<SqlPlayground />);

    fireEvent.click(screen.getByRole("button", { name: "set-input" }));
    fireEvent.click(screen.getByRole("button", { name: "Formatear" }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    expect(formatSqlAsyncMock).toHaveBeenCalled();
    expect(toastMocks.success).toHaveBeenCalledWith("SQL formateado correctamente");
    expect(screen.getByTestId("output-code").textContent).toBe("SELECT *\nFROM users");
  });

  it("format error → error shown, editor unchanged", async () => {
    formatSqlAsyncMock.mockResolvedValueOnce({ ok: false, error: "parse error near SELEKT" });
    vi.useFakeTimers();
    render(<SqlPlayground />);

    fireEvent.click(screen.getByRole("button", { name: "set-input" }));
    fireEvent.click(screen.getByRole("button", { name: "Formatear" }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    expect(toastMocks.error).toHaveBeenCalledWith("parse error near SELEKT");
  });

  it("minify → single-line output", async () => {
    vi.useFakeTimers();
    render(<SqlPlayground />);

    fireEvent.click(screen.getByRole("button", { name: "set-input" }));
    fireEvent.click(screen.getByRole("button", { name: "Minificar" }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    expect(minifySqlAsyncMock).toHaveBeenCalled();
    expect(toastMocks.success).toHaveBeenCalledWith("SQL minificado correctamente");
    expect(screen.getByTestId("output-code").textContent).toBe("SELECT * FROM users");
  });

  it("execute success → JSON output rendered in code editor", async () => {
    vi.useFakeTimers();
    render(<SqlPlayground />);

    fireEvent.click(screen.getByRole("button", { name: "set-input" }));
    fireEvent.click(screen.getByRole("button", { name: "Ejecutar" }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    expect(executeSqlAsyncMock).toHaveBeenCalledWith("SELECT * FROM users");
    expect(toastMocks.success).toHaveBeenCalledWith("Consulta ejecutada correctamente");

    const expectedResult = {
      columns: ["id", "name"],
      rows: [[1, "Alice"]],
      elapsedMs: 5,
      truncated: false,
    };
    const jsonEditor = screen.getByTestId("code-editor-json");
    expect(jsonEditor.textContent).toBe(JSON.stringify(expectedResult, null, 2));
  });

  it("execute error → error banner shown", async () => {
    executeSqlAsyncMock.mockResolvedValueOnce({
      ok: false,
      error: "near 'SELEKT': syntax error",
    });
    vi.useFakeTimers();
    render(<SqlPlayground />);

    fireEvent.click(screen.getByRole("button", { name: "set-input" }));
    fireEvent.click(screen.getByRole("button", { name: "Ejecutar" }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    expect(toastMocks.error).toHaveBeenCalledWith("near 'SELEKT': syntax error");
    expect(screen.getByTestId("sql-error-banner")).toBeInTheDocument();
    expect(screen.getByTestId("sql-error-banner").textContent).toContain("near 'SELEKT': syntax error");
  });

  it("loading state on first run → shows Loading SQLite engine…", async () => {
    let resolveExecute!: (v: { ok: true; value: SqlExecuteResult }) => void;
    executeSqlAsyncMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveExecute = resolve;
        }),
    );

    render(<SqlPlayground />);

    fireEvent.click(screen.getByRole("button", { name: "set-input" }));
    fireEvent.click(screen.getByRole("button", { name: "Ejecutar" }));

    // While loading
    expect(screen.getByTestId("sql-loading")).toBeInTheDocument();
    expect(screen.getByTestId("sql-loading").textContent).toContain("Loading SQLite engine…");

    // Resolve the promise
    await act(async () => {
      resolveExecute({
        ok: true,
        value: { columns: [], rows: [], elapsedMs: 1, truncated: false },
      });
    });

    // Loading state gone
    expect(screen.queryByTestId("sql-loading")).not.toBeInTheDocument();
  });

  it("download → .sql file triggered", async () => {
    render(<SqlPlayground />);

    fireEvent.click(screen.getByRole("button", { name: "set-input" }));
    fireEvent.click(screen.getByRole("button", { name: "download-input" }));

    expect(downloadFileMock).toHaveBeenCalledWith(
      "SELECT * FROM users",
      "query.sql",
      "application/sql",
    );
  });

  it("storage restore on mount → last SQL loaded into editor", () => {
    storageMocks.loadLastSql.mockReturnValueOnce("SELECT 42 AS answer");

    render(<SqlPlayground />);

    expect(screen.getByTestId("input-code").textContent).toBe("SELECT 42 AS answer");
  });
});
