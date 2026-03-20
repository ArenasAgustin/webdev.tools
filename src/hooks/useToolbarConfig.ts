import { useMemo } from "react";
import type { ToolbarAction, ToolbarConfig } from "@/types/toolbar";

export interface UseToolbarConfigParams<M extends string, TFormat, TMinify> {
  mode: M;
  handleFormat: () => void;
  handleMinify: () => void;
  formatConfig: TFormat;
  setFormatConfig: (config: TFormat) => void;
  minifyConfig: TMinify;
  setMinifyConfig: (config: TMinify) => void;
  modal: { isOpen: boolean; setIsOpen: (open: boolean) => void };
  /** Execute action handler (JS) — prepended before Format */
  handleExecute?: () => void;
  /** Override default grid class for toolbar layout */
  gridClassName?: string;
  /** Disables and shows spinner on all transform buttons while an operation is running */
  isProcessing?: boolean;
  /** Handler to open the keyboard shortcuts modal */
  onOpenShortcuts?: () => void;
}

interface CleanParams<TClean> {
  handleClean: () => void;
  cleanConfig: TClean;
  setCleanConfig: (config: TClean) => void;
}

interface ToolbarConfigBase<M extends string, TFormat, TMinify> {
  mode: M;
  format: TFormat;
  onFormatChange: (config: TFormat) => void;
  minify: TMinify;
  onMinifyChange: (config: TMinify) => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

/**
 * Hook that builds memoized toolbar tools and config for playgrounds.
 * Centralizes the common Format + Minify actions and config modal pattern,
 * with support for extra actions (Execute in JS, Clean in JSON).
 */
// Overload: with clean config (JSON)
export function useToolbarConfig<M extends string, TFormat, TMinify, TClean>(
  params: UseToolbarConfigParams<M, TFormat, TMinify> & CleanParams<TClean>,
): {
  readonly toolbarTools: ToolbarConfig;
  readonly toolbarConfig: ToolbarConfigBase<M, TFormat, TMinify> & {
    clean: TClean;
    onCleanChange: (config: TClean) => void;
  };
};
// Overload: without clean config (CSS, HTML, JS)
export function useToolbarConfig<M extends string, TFormat, TMinify>(
  params: UseToolbarConfigParams<M, TFormat, TMinify>,
): {
  readonly toolbarTools: ToolbarConfig;
  readonly toolbarConfig: ToolbarConfigBase<M, TFormat, TMinify>;
};
// Implementation
export function useToolbarConfig<M extends string, TFormat, TMinify, TClean = undefined>({
  mode,
  handleFormat,
  handleMinify,
  formatConfig,
  setFormatConfig,
  minifyConfig,
  setMinifyConfig,
  modal,
  handleExecute,
  handleClean,
  cleanConfig,
  setCleanConfig,
  gridClassName = "grid grid-cols-2 lg:grid-cols-5 gap-2",
  isProcessing = false,
  onOpenShortcuts,
}: UseToolbarConfigParams<M, TFormat, TMinify> & Partial<CleanParams<TClean>>) {
  const toolbarTools = useMemo<ToolbarConfig>(() => {
    const actions: ToolbarAction[] = [];
    if (handleExecute) {
      actions.push({
        label: "Ejecutar",
        icon: "play",
        variant: "orange",
        onClick: handleExecute,
        disabled: isProcessing,
        loading: isProcessing,
      });
    }
    actions.push(
      {
        label: "Formatear",
        icon: "indent",
        variant: "primary",
        onClick: handleFormat,
        disabled: isProcessing,
        loading: isProcessing,
      },
      {
        label: "Minificar",
        icon: "compress",
        variant: "purple",
        onClick: handleMinify,
        disabled: isProcessing,
        loading: isProcessing,
      },
    );
    if (handleClean) {
      actions.push({
        label: "Limpiar vacíos",
        icon: "broom",
        variant: "orange",
        onClick: handleClean,
        disabled: isProcessing,
        loading: isProcessing,
      });
    }
    return {
      actions,
      configButtonTitle: "Configurar herramientas",
      gridClassName,
      onOpenShortcuts,
    };
  }, [handleFormat, handleMinify, handleExecute, handleClean, gridClassName, isProcessing, onOpenShortcuts]);

  const toolbarConfig = useMemo(() => {
    const base = {
      mode,
      format: formatConfig,
      onFormatChange: setFormatConfig,
      minify: minifyConfig,
      onMinifyChange: setMinifyConfig,
      isOpen: modal.isOpen,
      onOpenChange: modal.setIsOpen,
    };
    if (cleanConfig !== undefined && setCleanConfig) {
      return { ...base, clean: cleanConfig, onCleanChange: setCleanConfig };
    }
    return base;
  }, [
    mode,
    formatConfig,
    setFormatConfig,
    minifyConfig,
    setMinifyConfig,
    modal.isOpen,
    modal.setIsOpen,
    cleanConfig,
    setCleanConfig,
  ]);

  return { toolbarTools, toolbarConfig } as const;
}
