import { useEffect, useMemo, useRef, useState } from "react";
import { Toolbar } from "@/components/layout/Toolbar";
import { CssEditors } from "./CssEditors";
import { cssPlaygroundConfig } from "./css.config";
import { useToast } from "@/hooks/useToast";
import { useModalState } from "@/hooks/useModalState";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useTextStats } from "@/hooks/useTextStats";
import { useCssParser } from "@/hooks/useCssParser";
import { useCssPlaygroundActions } from "@/hooks/useCssPlaygroundActions";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { MAX_INPUT_BYTES, MAX_INPUT_LABEL } from "@/utils/constants/limits";
import { loadCssToolsConfig, loadLastCss, saveLastCss } from "@/services/storage";
import type { CssFormatConfig, CssMinifyConfig } from "@/types/css";
import type { ToolbarConfig } from "@/types/toolbar";
import { DEFAULT_CSS_FORMAT_CONFIG, DEFAULT_CSS_MINIFY_CONFIG } from "@/types/css";

const savedConfig = loadCssToolsConfig();

export function CssPlayground() {
  const [inputCss, setInputCss] = useState<string>(
    () => loadLastCss() || cssPlaygroundConfig.example,
  );
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [formatConfig, setFormatConfig] = useState<CssFormatConfig>(
    () => savedConfig?.format ?? DEFAULT_CSS_FORMAT_CONFIG,
  );
  const [minifyConfig, setMinifyConfig] = useState<CssMinifyConfig>(
    () => savedConfig?.minify ?? DEFAULT_CSS_MINIFY_CONFIG,
  );

  const configModal = useModalState();
  const debouncedInputCss = useDebouncedValue(inputCss, 300);
  const inputStats = useTextStats(inputCss);
  const inputTooLarge = inputStats.bytes > MAX_INPUT_BYTES;
  const inputWarning = inputTooLarge
    ? "Entrada grande: algunas operaciones pueden ser lentas"
    : null;
  const sizeWarningShown = useRef(false);

  useEffect(() => {
    saveLastCss(debouncedInputCss);
  }, [debouncedInputCss]);

  const toast = useToast();

  useEffect(() => {
    if (inputTooLarge && !sizeWarningShown.current) {
      toast.info(`El contenido supera ${MAX_INPUT_LABEL}. Algunas operaciones pueden ser lentas.`);
      sizeWarningShown.current = true;
    }

    if (!inputTooLarge) {
      sizeWarningShown.current = false;
    }
  }, [inputTooLarge, toast]);

  const validation = useCssParser(debouncedInputCss);

  const {
    handleClearInput,
    handleLoadExample,
    handleCopyOutput,
    handleDownloadInput,
    handleDownloadOutput,
    handleFormat,
    // handleMinify,
  } = useCssPlaygroundActions({
    inputCss,
    setInputCss,
    output,
    setOutput,
    setError,
    inputTooLarge,
    inputTooLargeMessage: `El contenido supera ${MAX_INPUT_LABEL}. Reduce el tamano para procesarlo.`,
    formatConfig,
    minifyConfig,
    toast,
  });

  useKeyboardShortcuts({
    onFormat: handleFormat,
    // onMinify: handleMinify,
    onCopyOutput: handleCopyOutput,
    onClearInput: handleClearInput,
    onOpenConfig: configModal.open,
  });

  const toolbarTools = useMemo<ToolbarConfig>(
    () => ({
      actions: [
        {
          label: "Formatear",
          icon: "indent",
          variant: "primary",
          onClick: handleFormat,
        },
        // {
        //   label: "Minificar",
        //   icon: "compress",
        //   variant: "purple",
        //   onClick: handleMinify,
        // },
      ],
      configButtonTitle: "Configurar herramientas",
      gridClassName: "grid grid-cols-1 lg:grid-cols-4 gap-2",
    }),
    [handleFormat],
  );

  const toolbarConfig = useMemo(
    () => ({
      mode: "css" as const,
      format: formatConfig,
      onFormatChange: setFormatConfig,
      minify: minifyConfig,
      onMinifyChange: setMinifyConfig,
      isOpen: configModal.isOpen,
      onOpenChange: configModal.setIsOpen,
    }),
    [
      formatConfig,
      minifyConfig,
      configModal.isOpen,
      configModal.setIsOpen,
      setFormatConfig,
      setMinifyConfig,
    ],
  );

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-4">
      <CssEditors
        inputCss={inputCss}
        output={output}
        error={error}
        validationState={validation}
        inputWarning={inputWarning}
        onInputChange={setInputCss}
        onClearInput={handleClearInput}
        onLoadExample={handleLoadExample}
        onCopyOutput={handleCopyOutput}
        onDownloadInput={handleDownloadInput}
        onDownloadOutput={handleDownloadOutput}
      />

      <Toolbar variant="generic" tools={toolbarTools} config={toolbarConfig} />
    </div>
  );
}
