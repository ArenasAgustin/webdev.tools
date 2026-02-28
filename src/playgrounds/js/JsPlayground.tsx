import { useState, useEffect, useRef, useMemo } from "react";
import { Toolbar } from "@/components/layout/Toolbar";
import { JsEditors } from "./JsEditors";
import { jsPlaygroundConfig } from "./js.config";
import { useToast } from "@/hooks/useToast";
import { useModalState } from "@/hooks/useModalState";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useTextStats } from "@/hooks/useTextStats";
import { useJsParser } from "@/hooks/useJsParser";
import { useJsPlaygroundActions } from "@/hooks/useJsPlaygroundActions";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { MAX_INPUT_BYTES, MAX_INPUT_LABEL } from "@/utils/constants/limits";
import { loadLastJs, saveLastJs, loadJsToolsConfig } from "@/services/storage";
import type { JsFormatConfig, JsMinifyConfig } from "@/types/js";
import type { ToolbarConfig } from "@/types/toolbar";
import { DEFAULT_JS_FORMAT_CONFIG, DEFAULT_JS_MINIFY_CONFIG } from "@/types/js";

const savedConfig = loadJsToolsConfig();

// Disable React Compiler optimization for this component due to dynamic code execution
/** @react-compiler-skip */

/**
 * JavaScript Playground - Execute and test JavaScript code
 */
export function JsPlayground() {
  const [inputCode, setInputCode] = useState<string>(
    () => loadLastJs() || jsPlaygroundConfig.example,
  );
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [formatConfig, setFormatConfig] = useState<JsFormatConfig>(
    savedConfig?.format ?? DEFAULT_JS_FORMAT_CONFIG,
  );
  const [minifyConfig, setMinifyConfig] = useState<JsMinifyConfig>(
    savedConfig?.minify ?? DEFAULT_JS_MINIFY_CONFIG,
  );

  // Modal state management
  const configModal = useModalState();

  const debouncedInputCode = useDebouncedValue(inputCode, 300);
  const inputStats = useTextStats(inputCode);
  const inputTooLarge = inputStats.bytes > MAX_INPUT_BYTES;
  const inputWarning = inputTooLarge
    ? "Entrada grande: algunas operaciones pueden ser lentas"
    : null;
  const sizeWarningShown = useRef(false);

  useEffect(() => {
    saveLastJs(debouncedInputCode);
  }, [debouncedInputCode]);

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

  const validation = useJsParser(debouncedInputCode);

  // Use JS playground actions hook
  const {
    handleClearInput,
    handleLoadExample,
    handleExecute,
    handleCopyOutput,
    handleDownloadInput,
    handleDownloadOutput,
    handleFormat,
    handleMinify,
  } = useJsPlaygroundActions({
    inputCode,
    setInputCode,
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
    onMinify: handleMinify,
    onCopyOutput: handleCopyOutput,
    onClearInput: handleClearInput,
    onOpenConfig: configModal.open,
  });

  // Memoize complex toolbar configuration to prevent re-renders
  const toolbarTools = useMemo<ToolbarConfig>(
    () => ({
      actions: [
        {
          label: "Ejecutar",
          icon: "play",
          variant: "orange",
          onClick: handleExecute,
        },
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
    [handleExecute, handleFormat, handleMinify],
  );

  const toolbarConfig = useMemo(
    () => ({
      mode: "js" as const,
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
      <JsEditors
        inputCode={inputCode}
        output={output}
        error={error}
        validationState={validation}
        inputWarning={inputWarning}
        onInputChange={setInputCode}
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
