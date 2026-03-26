import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

  it("does NOT render the Abrir button when onImportFile is not provided", () => {
    render(<InputActions {...baseProps} />);
    expect(screen.queryByRole("button", { name: /Importar archivo/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("renders the Abrir button when onImportFile prop is provided", () => {
    render(<InputActions {...baseProps} onImportFile={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Importar archivo/i })).toBeInTheDocument();
  });

  it("renders a hidden file input with the correct accept attribute when onImportFile is provided", () => {
    render(
      <InputActions
        {...baseProps}
        onImportFile={vi.fn()}
        acceptExtensions=".json"
      />,
    );
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    expect(fileInput).not.toBeNull();
    expect(fileInput.accept).toBe(".json");
    expect(fileInput.className).toContain("hidden");
  });

  it("clicking Abrir triggers a click on the hidden file input", () => {
    render(
      <InputActions
        {...baseProps}
        onImportFile={vi.fn()}
        acceptExtensions=".txt"
      />,
    );

    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    const clickSpy = vi.spyOn(fileInput, "click").mockImplementation(() => undefined);

    fireEvent.click(screen.getByRole("button", { name: /Importar archivo/i }));

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("onChange on the file input calls onImportFile with the selected file", () => {
    const onImportFile = vi.fn();
    render(<InputActions {...baseProps} onImportFile={onImportFile} acceptExtensions=".txt" />);

    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]')!;
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
    render(<InputActions {...baseProps} onImportFile={onImportFile} acceptExtensions=".txt" />);

    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]')!;
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
    render(<InputActions {...baseProps} onImportFile={onImportFile} acceptExtensions=".txt" />);

    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]')!;

    Object.defineProperty(fileInput, "files", {
      value: [],
      configurable: true,
    });
    fireEvent.change(fileInput);

    expect(onImportFile).not.toHaveBeenCalled();
  });

  it("always renders Limpiar, Ejemplo, Descargar, and expand buttons", () => {
    render(<InputActions {...baseProps} />);
    expect(screen.getByRole("button", { name: /Limpiar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ejemplo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Descargar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Expandir editor/i })).toBeInTheDocument();
  });
});
