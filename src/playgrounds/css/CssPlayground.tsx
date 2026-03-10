import { useMemo, useState, useEffect } from "react";
import { Toolbar } from "@/components/layout/Toolbar";
import { PlaygroundLayout } from "@/components/layout/PlaygroundLayout";
import { CssEditors } from "./CssEditors";
import { cssPlaygroundConfig } from "./css.config";
import { useToast } from "@/hooks/useToast";
import { useModalState } from "@/hooks/useModalState";
import { usePlaygroundInputLifecycle } from "@/hooks/usePlaygroundInputLifecycle";
import { useMergedConfigState } from "@/hooks/useMergedConfigState";
import { useCssParser } from "@/hooks/useCssParser";
import { useCssPlaygroundActions } from "@/hooks/useCssPlaygroundActions";
import { usePlaygroundShortcuts } from "@/hooks/usePlaygroundShortcuts";
import { MAX_INPUT_LABEL } from "@/utils/constants/limits";
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
  const [formatConfig, setFormatConfig] = useMergedConfigState<CssFormatConfig>(
    DEFAULT_CSS_FORMAT_CONFIG,
    savedConfig?.format,
  );
  const [minifyConfig, setMinifyConfig] = useMergedConfigState<CssMinifyConfig>(
    DEFAULT_CSS_MINIFY_CONFIG,
    savedConfig?.minify,
  );

  const configModal = useModalState();
  const toast = useToast();

  const {
    debouncedInput: debouncedInputCss,
    inputTooLarge,
    inputWarning,
  } = usePlaygroundInputLifecycle({
    input: inputCss,
    saveInput: saveLastCss,
    toast,
  });

  const validation = useCssParser(debouncedInputCss);

  useEffect(() => {
    void import("@/services/formatter/prettier");
    void import("@/services/css/transform");
  }, []);

  const {
    handleClearInput,
    handleLoadExample,
    handleCopyOutput,
    handleDownloadInput,
    handleDownloadOutput,
    handleFormat,
    handleMinify,
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

  usePlaygroundShortcuts({
    onFormat: handleFormat,
    onMinify: handleMinify,
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
        {
          label: "Minificar",
          icon: "compress",
          variant: "purple",
          onClick: handleMinify,
        },
      ],
      configButtonTitle: "Configurar herramientas",
      gridClassName: "grid grid-cols-2 lg:grid-cols-5 gap-2",
    }),
    [handleFormat, handleMinify],
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
    <PlaygroundLayout
      editors={
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
      }
      toolbar={<Toolbar variant="generic" tools={toolbarTools} config={toolbarConfig} />}
    />
  );
}
