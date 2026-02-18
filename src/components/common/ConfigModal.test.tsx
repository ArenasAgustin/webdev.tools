import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfigModal } from "./ConfigModal";
import type { FormatConfig, MinifyConfig, CleanConfig } from "@/types/json";
import {
  DEFAULT_JS_FORMAT_CONFIG,
  DEFAULT_JS_MINIFY_CONFIG,
  type JsFormatConfig,
  type JsMinifyConfig,
} from "@/types/js";

// Mock storage functions
vi.mock("@/services/storage", () => ({
  saveToolsConfig: vi.fn(),
  removeToolsConfig: vi.fn(),
  saveJsToolsConfig: vi.fn(),
  removeJsToolsConfig: vi.fn(),
}));

describe("ConfigModal", () => {
  const mockFormatConfig: FormatConfig = {
    indent: 2,
    sortKeys: false,
    autoCopy: false,
  };

  const mockMinifyConfig: MinifyConfig = {
    removeSpaces: true,
    sortKeys: false,
    autoCopy: false,
  };

  const mockCleanConfig: CleanConfig = {
    removeNull: true,
    removeUndefined: true,
    removeEmptyString: false,
    removeEmptyArray: false,
    removeEmptyObject: false,
    outputFormat: "format",
    autoCopy: false,
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    formatConfig: mockFormatConfig,
    onFormatConfigChange: vi.fn(),
    minifyConfig: mockMinifyConfig,
    onMinifyConfigChange: vi.fn(),
    cleanConfig: mockCleanConfig,
    onCleanConfigChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when closed", () => {
    render(<ConfigModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText("Configuración de Herramientas")).not.toBeInTheDocument();
  });

  it("should render when open", () => {
    render(<ConfigModal {...defaultProps} />);

    expect(screen.getByText("Configuración de Herramientas")).toBeInTheDocument();
  });

  it("should render all three config sections", () => {
    render(<ConfigModal {...defaultProps} />);

    expect(screen.getByText("Formatear JSON")).toBeInTheDocument();
    expect(screen.getByText("Minificar JSON")).toBeInTheDocument();
    expect(screen.getByText("Limpiar Valores Vacíos")).toBeInTheDocument();
  });

  describe("Format Config", () => {
    it("should change indent when clicking indent options", () => {
      const onFormatConfigChange = vi.fn();
      render(<ConfigModal {...defaultProps} onFormatConfigChange={onFormatConfigChange} />);

      const fourSpacesButton = screen.getByText("4 espacios");
      fireEvent.click(fourSpacesButton);

      expect(onFormatConfigChange).toHaveBeenCalledWith({
        ...mockFormatConfig,
        indent: 4,
      });
    });

    it("should toggle sortKeys checkbox", () => {
      const onFormatConfigChange = vi.fn();
      render(<ConfigModal {...defaultProps} onFormatConfigChange={onFormatConfigChange} />);

      const sortKeysCheckbox = screen.getByLabelText("Habilitar ordenamiento");
      fireEvent.click(sortKeysCheckbox);

      expect(onFormatConfigChange).toHaveBeenCalledWith({
        ...mockFormatConfig,
        sortKeys: true,
      });
    });

    it("should toggle autoCopy checkbox in format section", () => {
      const onFormatConfigChange = vi.fn();
      render(<ConfigModal {...defaultProps} onFormatConfigChange={onFormatConfigChange} />);

      const autoCopyCheckboxes = screen.getAllByLabelText("Habilitar auto-copia");
      fireEvent.click(autoCopyCheckboxes[0]); // First one is for format section

      expect(onFormatConfigChange).toHaveBeenCalledWith({
        ...mockFormatConfig,
        autoCopy: true,
      });
    });
  });

  describe("Minify Config", () => {
    it("should toggle removeSpaces checkbox", () => {
      const onMinifyConfigChange = vi.fn();
      render(<ConfigModal {...defaultProps} onMinifyConfigChange={onMinifyConfigChange} />);

      const removeSpacesCheckbox = screen.getByLabelText("Eliminar todos los espacios");
      fireEvent.click(removeSpacesCheckbox);

      expect(onMinifyConfigChange).toHaveBeenCalledWith({
        ...mockMinifyConfig,
        removeSpaces: false, // Was true, now false
      });
    });

    it("should toggle sortKeys in minify section", () => {
      const onMinifyConfigChange = vi.fn();
      render(<ConfigModal {...defaultProps} onMinifyConfigChange={onMinifyConfigChange} />);

      const sortKeysCheckbox = screen.getByLabelText("Ordenar claves alfabéticamente");
      fireEvent.click(sortKeysCheckbox);

      expect(onMinifyConfigChange).toHaveBeenCalledWith({
        ...mockMinifyConfig,
        sortKeys: true,
      });
    });

    it("should toggle autoCopy in minify section", () => {
      const onMinifyConfigChange = vi.fn();
      render(<ConfigModal {...defaultProps} onMinifyConfigChange={onMinifyConfigChange} />);

      const autoCopyCheckboxes = screen.getAllByLabelText("Habilitar auto-copia");
      fireEvent.click(autoCopyCheckboxes[1]); // Second one is for minify section

      expect(onMinifyConfigChange).toHaveBeenCalledWith({
        ...mockMinifyConfig,
        autoCopy: true,
      });
    });
  });

  describe("Clean Config", () => {
    it("should toggle removeNull checkbox", () => {
      const onCleanConfigChange = vi.fn();
      render(<ConfigModal {...defaultProps} onCleanConfigChange={onCleanConfigChange} />);

      const removeNullCheckbox = screen.getByLabelText("null");
      fireEvent.click(removeNullCheckbox);

      expect(onCleanConfigChange).toHaveBeenCalledWith({
        ...mockCleanConfig,
        removeNull: false, // Was true, now false
      });
    });

    it("should toggle removeUndefined checkbox", () => {
      const onCleanConfigChange = vi.fn();
      render(<ConfigModal {...defaultProps} onCleanConfigChange={onCleanConfigChange} />);

      const removeUndefinedCheckbox = screen.getByLabelText("undefined");
      fireEvent.click(removeUndefinedCheckbox);

      expect(onCleanConfigChange).toHaveBeenCalledWith({
        ...mockCleanConfig,
        removeUndefined: false,
      });
    });

    it("should toggle removeEmptyString checkbox", () => {
      const onCleanConfigChange = vi.fn();
      render(<ConfigModal {...defaultProps} onCleanConfigChange={onCleanConfigChange} />);

      const removeEmptyStringCheckbox = screen.getByLabelText('"" (vacío)');
      fireEvent.click(removeEmptyStringCheckbox);

      expect(onCleanConfigChange).toHaveBeenCalledWith({
        ...mockCleanConfig,
        removeEmptyString: true, // Was false, now true
      });
    });

    it("should toggle removeEmptyArray checkbox", () => {
      const onCleanConfigChange = vi.fn();
      render(<ConfigModal {...defaultProps} onCleanConfigChange={onCleanConfigChange} />);

      const removeEmptyArrayCheckbox = screen.getByLabelText("[] (array vacío)");
      fireEvent.click(removeEmptyArrayCheckbox);

      expect(onCleanConfigChange).toHaveBeenCalledWith({
        ...mockCleanConfig,
        removeEmptyArray: true,
      });
    });

    it("should toggle removeEmptyObject checkbox", () => {
      const onCleanConfigChange = vi.fn();
      render(<ConfigModal {...defaultProps} onCleanConfigChange={onCleanConfigChange} />);

      const removeEmptyObjectCheckbox = screen.getByLabelText("{} (objeto vacío)");
      fireEvent.click(removeEmptyObjectCheckbox);

      expect(onCleanConfigChange).toHaveBeenCalledWith({
        ...mockCleanConfig,
        removeEmptyObject: true,
      });
    });

    it("should change outputFormat radio", () => {
      const onCleanConfigChange = vi.fn();
      render(<ConfigModal {...defaultProps} onCleanConfigChange={onCleanConfigChange} />);

      const minifyRadio = screen.getByLabelText("Minificar");
      fireEvent.click(minifyRadio);

      expect(onCleanConfigChange).toHaveBeenCalledWith({
        ...mockCleanConfig,
        outputFormat: "minify",
      });
    });

    it("should toggle autoCopy in clean section", () => {
      const onCleanConfigChange = vi.fn();
      render(<ConfigModal {...defaultProps} onCleanConfigChange={onCleanConfigChange} />);

      const autoCopyCheckboxes = screen.getAllByLabelText("Habilitar auto-copia");
      fireEvent.click(autoCopyCheckboxes[2]); // Third one is for clean section

      expect(onCleanConfigChange).toHaveBeenCalledWith({
        ...mockCleanConfig,
        autoCopy: true,
      });
    });
  });

  describe("Actions", () => {
    it("should call onClose when modal is closed", () => {
      const onClose = vi.fn();
      render(<ConfigModal {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByLabelText("Cerrar modal");
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledOnce();
    });

    it("should reset all configs to default when reset button is clicked", async () => {
      const { removeToolsConfig } = await import("@/services/storage");
      const onFormatConfigChange = vi.fn();
      const onMinifyConfigChange = vi.fn();
      const onCleanConfigChange = vi.fn();

      render(
        <ConfigModal
          {...defaultProps}
          onFormatConfigChange={onFormatConfigChange}
          onMinifyConfigChange={onMinifyConfigChange}
          onCleanConfigChange={onCleanConfigChange}
        />,
      );

      const resetButton = screen.getByText("Restablecer");
      fireEvent.click(resetButton);

      expect(onFormatConfigChange).toHaveBeenCalled();
      expect(onMinifyConfigChange).toHaveBeenCalled();
      expect(onCleanConfigChange).toHaveBeenCalled();
      expect(removeToolsConfig).toHaveBeenCalled();
    });

    it("should save config when modal is closed", async () => {
      const { saveToolsConfig } = await import("@/services/storage");
      const onClose = vi.fn();

      render(<ConfigModal {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByLabelText("Cerrar modal");
      fireEvent.click(closeButton);

      expect(saveToolsConfig).toHaveBeenCalledWith({
        format: mockFormatConfig,
        minify: mockMinifyConfig,
        clean: mockCleanConfig,
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("JS mode", () => {
    const jsFormatConfig: JsFormatConfig = {
      indentSize: 2,
      autoCopy: false,
    };

    const jsMinifyConfig: JsMinifyConfig = {
      removeComments: true,
      removeSpaces: true,
      autoCopy: false,
    };

    const jsProps = {
      mode: "js" as const,
      isOpen: true,
      onClose: vi.fn(),
      formatConfig: jsFormatConfig,
      onFormatConfigChange: vi.fn(),
      minifyConfig: jsMinifyConfig,
      onMinifyConfigChange: vi.fn(),
    };

    it("renders JS sections and hides clean section", () => {
      render(<ConfigModal {...jsProps} />);

      expect(screen.getByText("Configuración de Herramientas JS")).toBeInTheDocument();
      expect(screen.getByText("Formatear JavaScript")).toBeInTheDocument();
      expect(screen.getByText("Minificar JavaScript")).toBeInTheDocument();
      expect(screen.queryByText("Limpiar Valores Vacíos")).not.toBeInTheDocument();
    });

    it("changes JS indent size", () => {
      const onFormatConfigChange = vi.fn();
      render(<ConfigModal {...jsProps} onFormatConfigChange={onFormatConfigChange} />);

      fireEvent.click(screen.getByRole("button", { name: "4 espacios" }));

      expect(onFormatConfigChange).toHaveBeenCalledWith({ ...jsFormatConfig, indentSize: 4 });
    });

    it("toggles JS minify options", () => {
      const onMinifyConfigChange = vi.fn();
      render(<ConfigModal {...jsProps} onMinifyConfigChange={onMinifyConfigChange} />);

      fireEvent.click(screen.getByLabelText("Eliminar comentarios"));
      fireEvent.click(screen.getByLabelText("Eliminar espacios"));

      expect(onMinifyConfigChange).toHaveBeenNthCalledWith(1, {
        ...jsMinifyConfig,
        removeComments: false,
      });
      expect(onMinifyConfigChange).toHaveBeenNthCalledWith(2, {
        ...jsMinifyConfig,
        removeSpaces: false,
      });
    });

    it("resets and persists JS config", async () => {
      const { removeJsToolsConfig, saveJsToolsConfig } = await import("@/services/storage");
      const onFormatConfigChange = vi.fn();
      const onMinifyConfigChange = vi.fn();
      const onClose = vi.fn();

      render(
        <ConfigModal
          {...jsProps}
          onFormatConfigChange={onFormatConfigChange}
          onMinifyConfigChange={onMinifyConfigChange}
          onClose={onClose}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /Restablecer/i }));
      expect(onFormatConfigChange).toHaveBeenCalledWith(DEFAULT_JS_FORMAT_CONFIG);
      expect(onMinifyConfigChange).toHaveBeenCalledWith(DEFAULT_JS_MINIFY_CONFIG);
      expect(removeJsToolsConfig).toHaveBeenCalled();

      fireEvent.click(screen.getByLabelText("Cerrar modal"));
      expect(saveJsToolsConfig).toHaveBeenCalledWith({
        format: jsFormatConfig,
        minify: jsMinifyConfig,
      });
      expect(onClose).toHaveBeenCalled();
    });
  });
});
