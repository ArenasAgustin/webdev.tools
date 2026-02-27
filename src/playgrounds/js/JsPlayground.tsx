import { useState, useEffect, useRef, useMemo } from "react";
import { ConfigModal } from "@/components/common/ConfigModal";
import { Toolbar } from "@/components/layout/Toolbar";
import { JsEditors } from "./JsEditors";
import { jsPlaygroundConfig } from "./js.config";
import { useToast } from "@/hooks/useToast";
import { useModalState } from "@/hooks/useModalState";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useTextStats } from "@/hooks/useTextStats";
import { useJsPlaygroundActions } from "@/hooks/useJsPlaygroundActions";
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
  const {
    isOpen: isConfigOpen,
    open: openConfigModal,
    close: closeConfigModal,
  } = useModalState();

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

  const syntaxError = useMemo(() => {
    const code = debouncedInputCode.trim();
    if (!code) return null;

    try {
      new Function(code);
      return null;
    } catch (parseError) {
      const message = parseError instanceof Error ? parseError.message : String(parseError);
      return `Error de sintaxis: ${message}`;
    }
  }, [debouncedInputCode]);

  const effectiveError = syntaxError ?? error;

  // Use JS playground actions hook
  const {
    handleClearInput,
    handleLoadExample,
    handleExecute,
    handleCopyInput,
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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.contentEditable === "true")
      ) {
        return;
      }

      const hasModifier = event.ctrlKey || event.metaKey;
      if (!hasModifier) return;

      const normalizedKey = event.key.length === 1 ? event.key.toUpperCase() : event.key;

      if (event.shiftKey && (event.code === "KeyF" || normalizedKey === "F")) {
        event.preventDefault();
        handleFormat();
        return;
      }

      if (event.shiftKey && (event.code === "KeyM" || normalizedKey === "M")) {
        event.preventDefault();
        handleMinify();
        return;
      }

      if (event.shiftKey && (event.code === "KeyC" || normalizedKey === "C")) {
        event.preventDefault();
        handleCopyOutput();
        return;
      }

      if (event.shiftKey && (event.code === "Delete" || normalizedKey === "Delete")) {
        event.preventDefault();
        handleClearInput();
        return;
      }

      if (event.code === "Comma" || event.key === "," || event.key === "Comma") {
        event.preventDefault();
        openConfigModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleFormat, handleMinify, handleCopyOutput, handleClearInput, openConfigModal]);

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
        {
          label: "Limpiar",
          icon: "trash",
          variant: "danger",
          onClick: handleClearInput,
        },
        {
          label: "Ejemplo",
          icon: "file-import",
          variant: "success",
          onClick: handleLoadExample,
        },
      ],
      onOpenConfig: openConfigModal,
      configButtonTitle: "Configurar herramientas",
      gridClassName: "grid grid-cols-2 lg:grid-cols-5 gap-2",
    }),
    [
      handleExecute,
      handleFormat,
      handleMinify,
      handleClearInput,
      handleLoadExample,
      openConfigModal,
    ],
  );

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-4">
      <JsEditors
        inputCode={inputCode}
        output={output}
        error={effectiveError}
        inputWarning={inputWarning}
        onInputChange={setInputCode}
        onCopyInput={handleCopyInput}
        onCopyOutput={handleCopyOutput}
        onDownloadInput={handleDownloadInput}
        onDownloadOutput={handleDownloadOutput}
      />

      <Toolbar variant="generic" tools={toolbarTools} />

      <ConfigModal
        mode="js"
        isOpen={isConfigOpen}
        onClose={closeConfigModal}
        formatConfig={formatConfig}
        onFormatConfigChange={setFormatConfig}
        minifyConfig={minifyConfig}
        onMinifyConfigChange={setMinifyConfig}
      />
    </div>
  );
}
