import { useState, useMemo, useEffect } from "react";
import { Toolbar } from "@/components/layout/Toolbar";
import { PlaygroundLayout } from "@/components/layout/PlaygroundLayout";
import { HtmlEditors } from "./HtmlEditors";
import { htmlPlaygroundConfig } from "./html.config";
import { useToast } from "@/hooks/useToast";
import { useModalState } from "@/hooks/useModalState";
import { usePlaygroundInputLifecycle } from "@/hooks/usePlaygroundInputLifecycle";
import { useMergedConfigState } from "@/hooks/useMergedConfigState";
import { useHtmlParser } from "@/hooks/useHtmlParser";
import { useHtmlPlaygroundActions } from "@/hooks/useHtmlPlaygroundActions";
import { usePlaygroundShortcuts } from "@/hooks/usePlaygroundShortcuts";
import { MAX_INPUT_LABEL } from "@/utils/constants/limits";
import { loadLastHtml, saveLastHtml, loadHtmlToolsConfig } from "@/services/storage";
import type { HtmlFormatConfig, HtmlMinifyConfig } from "@/types/html";
import type { ToolbarConfig } from "@/types/toolbar";
import { DEFAULT_HTML_FORMAT_CONFIG, DEFAULT_HTML_MINIFY_CONFIG } from "@/types/html";

const savedConfig = loadHtmlToolsConfig();

export function HtmlPlayground() {
  const [inputHtml, setInputHtml] = useState<string>(
    () => loadLastHtml() || htmlPlaygroundConfig.example,
  );
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [formatConfig, setFormatConfig] = useMergedConfigState<HtmlFormatConfig>(
    DEFAULT_HTML_FORMAT_CONFIG,
    savedConfig?.format,
  );
  const [minifyConfig, setMinifyConfig] = useMergedConfigState<HtmlMinifyConfig>(
    DEFAULT_HTML_MINIFY_CONFIG,
    savedConfig?.minify,
  );

  const configModal = useModalState();
  const toast = useToast();

  const {
    debouncedInput: debouncedInputHtml,
    inputTooLarge,
    inputWarning,
  } = usePlaygroundInputLifecycle({
    input: inputHtml,
    saveInput: saveLastHtml,
    toast,
  });

  const validation = useHtmlParser(debouncedInputHtml);

  useEffect(() => {
    void import("@/services/formatter/prettier");
    void import("@/services/html/transform");
  }, []);

  const {
    handleClearInput,
    handleLoadExample,
    handleCopyOutput,
    handleDownloadInput,
    handleDownloadOutput,
    handleFormat,
    handleMinify,
  } = useHtmlPlaygroundActions({
    inputHtml,
    setInputHtml,
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
      mode: "html" as const,
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
        <HtmlEditors
          inputHtml={inputHtml}
          output={output}
          error={error}
          validationState={validation}
          inputWarning={inputWarning}
          onInputChange={setInputHtml}
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
