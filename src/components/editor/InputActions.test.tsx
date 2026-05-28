import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderWithI18n } from "@/test/test-utils";
import { fireEvent, cleanup } from "@testing-library/react";
import { InputActions } from "./InputActions";

describe("InputActions", () => {
  const baseProps = {
    onClearInput: vi.fn(),
    onLoadExample: vi.fn(),
    onDownloadInput: vi.fn(),
    onExpand: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("does NOT render the Abrir button when onImportFile is not provided", () => {
    const renderResult = renderWithI18n(<InputActions {...baseProps} />);
    expect(renderResult.queryByRole("button", { name: /Importar archivo/i })).not.toBeInTheDocument();
    expect(renderResult.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("renders the Abrir button when onImportFile prop is provided", () => {
    const renderResult = renderWithI18n(<InputActions {...baseProps} onImportFile={vi.fn()} />);
    expect(renderResult.getByRole("button", { name: /Importar archivo/i })).toBeInTheDocument();
  });

  it("renders a hidden file input with the correct accept attribute when onImportFile is provided", () => {
    const renderResult = renderWithI18n(<InputActions {...baseProps} onImportFile={vi.fn()} acceptExtensions=".json" />);
    const fileInput = renderResult.container.querySelector<HTMLInputElement>('input[type="file"]')!;
    expect(fileInput).not.toBeNull();
    expect(fileInput.accept).toBe(".json");
    expect(fileInput.className).toContain("hidden");
  });

  it("clicking Abrir triggers a click on the hidden file input", () => {
    const renderResult = renderWithI18n(<InputActions {...baseProps} onImportFile={vi.fn()} acceptExtensions=".txt" />);

    const fileInput = renderResult.container.querySelector<HTMLInputElement>('input[type="file"]')!;
    const clickSpy = vi.spyOn(fileInput, "click").mockImplementation(() => undefined);

    fireEvent.click(renderResult.getByRole("button", { name: /Importar archivo/i }));

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("onChange on the file input calls onImportFile with the selected file", () => {
    const onImportFile = vi.fn();
    const renderResult = renderWithI18n(<InputActions {...baseProps} onImportFile={onImportFile} acceptExtensions=".txt" />);

    const fileInput = renderResult.container.querySelector<HTMLInputElement>('input[type="file"]')!;
    const file = new File(["content"], "test.txt", { type: "text/plain" });

    // Simulate file selection
    Object.defineProperty(fileInput, "files", {
      value: [file],
      configurable: true,
    });
    fireEvent.change(fileInput);

    expect(onImportFile).toHaveBeenCalledOnce();
    expect(onImportFile).toHaveBeenCalledWith(file);
  });

  it("resets e.target.value after file selection", () => {
    const onImportFile = vi.fn();
    const renderResult = renderWithI18n(<InputActions {...baseProps} onImportFile={onImportFile} acceptExtensions=".txt" />);

    const fileInput = renderResult.container.querySelector<HTMLInputElement>('input[type="file"]')!;
    const file = new File(["data"], "a.txt", { type: "text/plain" });

    Object.defineProperty(fileInput, "files", {
      value: [file],
      configurable: true,
    });

    // value should be reset to "" after onChange (prevents re-selecting same file from being ignored)
    fireEvent.change(fileInput);
    expect(fileInput.value).toBe("");
  });

  it("does not call onImportFile when no file is selected (cancelled picker)", () => {
    const onImportFile = vi.fn();
    const renderResult = renderWithI18n(<InputActions {...baseProps} onImportFile={onImportFile} acceptExtensions=".txt" />);

    const fileInput = renderResult.container.querySelector<HTMLInputElement>('input[type="file"]')!;

    Object.defineProperty(fileInput, "files", {
      value: [],
      configurable: true,
    });
    fireEvent.change(fileInput);

    expect(onImportFile).not.toHaveBeenCalled();
  });

  it("always renders Limpiar, Ejemplo, Descargar, and expand buttons", () => {
    const renderResult = renderWithI18n(<InputActions {...baseProps} />);
    expect(renderResult.getByRole("button", { name: /Limpiar/i })).toBeInTheDocument();
    expect(renderResult.getByRole("button", { name: /Ejemplo/i })).toBeInTheDocument();
    expect(renderResult.getByRole("button", { name: /Descargar/i })).toBeInTheDocument();
    expect(renderResult.getByRole("button", { name: /Expandir editor/i })).toBeInTheDocument();
  });
});
