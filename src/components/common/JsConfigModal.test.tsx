import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { JsConfigModal } from "./JsConfigModal";
import { DEFAULT_JS_FORMAT_CONFIG, DEFAULT_JS_MINIFY_CONFIG, type JsFormatConfig, type JsMinifyConfig } from "@/types/js";

describe("JsConfigModal", () => {
  const formatConfig: JsFormatConfig = {
    indentSize: 2,
    autoCopy: false,
  };

  const minifyConfig: JsMinifyConfig = {
    removeComments: true,
    removeSpaces: true,
    autoCopy: false,
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    formatConfig,
    onFormatConfigChange: vi.fn(),
    minifyConfig,
    onMinifyConfigChange: vi.fn(),
  };

  it("does not render when closed", () => {
    render(<JsConfigModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText("Configuracion de herramientas JS")).not.toBeInTheDocument();
  });

  it("changes indent size", () => {
    const onFormatConfigChange = vi.fn();
    render(<JsConfigModal {...defaultProps} onFormatConfigChange={onFormatConfigChange} />);

    fireEvent.click(screen.getByRole("button", { name: "4 espacios" }));

    expect(onFormatConfigChange).toHaveBeenCalledWith({ ...formatConfig, indentSize: 4 });
  });

  it("toggles format auto-copy", () => {
    const onFormatConfigChange = vi.fn();
    render(<JsConfigModal {...defaultProps} onFormatConfigChange={onFormatConfigChange} />);

    const checkboxes = screen.getAllByLabelText("Habilitar auto-copia");
    fireEvent.click(checkboxes[0]);

    expect(onFormatConfigChange).toHaveBeenCalledWith({ ...formatConfig, autoCopy: true });
  });

  it("toggles minify options", () => {
    const onMinifyConfigChange = vi.fn();
    render(<JsConfigModal {...defaultProps} onMinifyConfigChange={onMinifyConfigChange} />);

    fireEvent.click(screen.getByLabelText("Eliminar comentarios"));
    fireEvent.click(screen.getByLabelText("Eliminar espacios"));

    expect(onMinifyConfigChange).toHaveBeenNthCalledWith(1, {
      ...minifyConfig,
      removeComments: false,
    });
    expect(onMinifyConfigChange).toHaveBeenNthCalledWith(2, {
      ...minifyConfig,
      removeSpaces: false,
    });
  });

  it("toggles minify auto-copy", () => {
    const onMinifyConfigChange = vi.fn();
    render(<JsConfigModal {...defaultProps} onMinifyConfigChange={onMinifyConfigChange} />);

    const checkboxes = screen.getAllByLabelText("Habilitar auto-copia");
    fireEvent.click(checkboxes[1]);

    expect(onMinifyConfigChange).toHaveBeenCalledWith({ ...minifyConfig, autoCopy: true });
  });

  it("resets both configs to defaults", () => {
    const onFormatConfigChange = vi.fn();
    const onMinifyConfigChange = vi.fn();

    render(
      <JsConfigModal
        {...defaultProps}
        onFormatConfigChange={onFormatConfigChange}
        onMinifyConfigChange={onMinifyConfigChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Restablecer/i }));

    expect(onFormatConfigChange).toHaveBeenCalledWith(DEFAULT_JS_FORMAT_CONFIG);
    expect(onMinifyConfigChange).toHaveBeenCalledWith(DEFAULT_JS_MINIFY_CONFIG);
  });
});
