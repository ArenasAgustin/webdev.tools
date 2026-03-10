import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useToolbarConfig } from "./useToolbarConfig";

const baseParams = () => ({
  mode: "css" as const,
  handleFormat: vi.fn(),
  handleMinify: vi.fn(),
  formatConfig: { indentSize: 2 },
  setFormatConfig: vi.fn(),
  minifyConfig: { removeComments: true },
  setMinifyConfig: vi.fn(),
  modal: { isOpen: false, setIsOpen: vi.fn() },
});

describe("useToolbarConfig", () => {
  describe("toolbarTools", () => {
    it("should return Format and Minify actions for base config", () => {
      const { result } = renderHook(() => useToolbarConfig(baseParams()));

      expect(result.current.toolbarTools.actions).toHaveLength(2);
      expect(result.current.toolbarTools.actions[0].label).toBe("Formatear");
      expect(result.current.toolbarTools.actions[1].label).toBe("Minificar");
    });

    it("should prepend Execute action when handleExecute is provided", () => {
      const params = { ...baseParams(), mode: "js" as const, handleExecute: vi.fn() };
      const { result } = renderHook(() => useToolbarConfig(params));

      expect(result.current.toolbarTools.actions).toHaveLength(3);
      expect(result.current.toolbarTools.actions[0].label).toBe("Ejecutar");
      expect(result.current.toolbarTools.actions[0].variant).toBe("orange");
      expect(result.current.toolbarTools.actions[1].label).toBe("Formatear");
      expect(result.current.toolbarTools.actions[2].label).toBe("Minificar");
    });

    it("should append Clean action when handleClean is provided", () => {
      const params = {
        ...baseParams(),
        mode: "json" as const,
        handleClean: vi.fn(),
        cleanConfig: { removeEmpty: true },
        setCleanConfig: vi.fn(),
      };
      const { result } = renderHook(() => useToolbarConfig(params));

      expect(result.current.toolbarTools.actions).toHaveLength(3);
      expect(result.current.toolbarTools.actions[0].label).toBe("Formatear");
      expect(result.current.toolbarTools.actions[1].label).toBe("Minificar");
      expect(result.current.toolbarTools.actions[2].label).toBe("Limpiar vacíos");
    });

    it("should use default grid class name", () => {
      const { result } = renderHook(() => useToolbarConfig(baseParams()));

      expect(result.current.toolbarTools.gridClassName).toBe(
        "grid grid-cols-2 lg:grid-cols-5 gap-2",
      );
    });

    it("should use custom grid class name when provided", () => {
      const params = {
        ...baseParams(),
        gridClassName: "grid grid-cols-2 sm:grid-cols-3 gap-2",
      };
      const { result } = renderHook(() => useToolbarConfig(params));

      expect(result.current.toolbarTools.gridClassName).toBe(
        "grid grid-cols-2 sm:grid-cols-3 gap-2",
      );
    });

    it("should include configButtonTitle", () => {
      const { result } = renderHook(() => useToolbarConfig(baseParams()));

      expect(result.current.toolbarTools.configButtonTitle).toBe("Configurar herramientas");
    });

    it("should wire onClick handlers to the provided callbacks", () => {
      const handleFormat = vi.fn();
      const handleMinify = vi.fn();
      const params = { ...baseParams(), handleFormat, handleMinify };
      const { result } = renderHook(() => useToolbarConfig(params));

      result.current.toolbarTools.actions[0].onClick();
      result.current.toolbarTools.actions[1].onClick();

      expect(handleFormat).toHaveBeenCalledOnce();
      expect(handleMinify).toHaveBeenCalledOnce();
    });
  });

  describe("toolbarConfig", () => {
    it("should return base config with mode, format, minify, and modal state", () => {
      const { result } = renderHook(() => useToolbarConfig(baseParams()));
      const config = result.current.toolbarConfig;

      expect(config.mode).toBe("css");
      expect(config.format).toEqual({ indentSize: 2 });
      expect(config.minify).toEqual({ removeComments: true });
      expect(config.isOpen).toBe(false);
      expect(typeof config.onFormatChange).toBe("function");
      expect(typeof config.onMinifyChange).toBe("function");
      expect(typeof config.onOpenChange).toBe("function");
    });

    it("should include clean config when cleanConfig is provided", () => {
      const cleanConfig = { removeEmpty: true };
      const setCleanConfig = vi.fn();
      const params = {
        ...baseParams(),
        mode: "json" as const,
        handleClean: vi.fn(),
        cleanConfig,
        setCleanConfig,
      };
      const { result } = renderHook(() => useToolbarConfig(params));
      const config = result.current.toolbarConfig;

      expect(config.clean).toEqual({ removeEmpty: true });
      expect(config.onCleanChange).toBe(setCleanConfig);
    });

    it("should pass modal isOpen state through", () => {
      const params = {
        ...baseParams(),
        modal: { isOpen: true, setIsOpen: vi.fn() },
      };
      const { result } = renderHook(() => useToolbarConfig(params));

      expect(result.current.toolbarConfig.isOpen).toBe(true);
    });

    it("should wire onOpenChange to modal.setIsOpen", () => {
      const setIsOpen = vi.fn();
      const params = {
        ...baseParams(),
        modal: { isOpen: false, setIsOpen },
      };
      const { result } = renderHook(() => useToolbarConfig(params));

      result.current.toolbarConfig.onOpenChange(true);

      expect(setIsOpen).toHaveBeenCalledWith(true);
    });
  });
});
