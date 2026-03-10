import { useState, useEffect } from "react";
import { Toolbar } from "@/components/layout/Toolbar";
import { PlaygroundLayout } from "@/components/layout/PlaygroundLayout";
import { JsEditors } from "./JsEditors";
import { jsPlaygroundConfig } from "./js.config";
import { useToast } from "@/hooks/useToast";
import { useModalState } from "@/hooks/useModalState";
import { usePlaygroundInputLifecycle } from "@/hooks/usePlaygroundInputLifecycle";
import { useMergedConfigState } from "@/hooks/useMergedConfigState";
import { useJsParser } from "@/hooks/useJsParser";
import { useJsPlaygroundActions } from "@/hooks/useJsPlaygroundActions";
import { usePlaygroundShortcuts } from "@/hooks/usePlaygroundShortcuts";
import { useToolbarConfig } from "@/hooks/useToolbarConfig";
import { MAX_INPUT_LABEL } from "@/utils/constants/limits";
import { loadLastJs, saveLastJs, loadJsToolsConfig } from "@/services/storage";
import type { JsFormatConfig, JsMinifyConfig } from "@/types/js";
import { DEFAULT_JS_FORMAT_CONFIG, DEFAULT_JS_MINIFY_CONFIG } from "@/types/js";

const savedConfig = loadJsToolsConfig();

// Disable React Compiler optimization for this component due to dynamic code execution
/** @react-compiler-skip */

/**
 * JavaScript Playground - Execute and test JavaScript code
 */
export function JsPlayground() {
  const [inputJs, setInputJs] = useState<string>(() => loadLastJs() || jsPlaygroundConfig.example);
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [formatConfig, setFormatConfig] = useMergedConfigState<JsFormatConfig>(
    DEFAULT_JS_FORMAT_CONFIG,
    savedConfig?.format,
  );
  const [minifyConfig, setMinifyConfig] = useMergedConfigState<JsMinifyConfig>(
    DEFAULT_JS_MINIFY_CONFIG,
    savedConfig?.minify,
  );

  // Modal state management
  const configModal = useModalState();
  const toast = useToast();

  const {
    debouncedInput: debouncedInputJs,
    inputTooLarge,
    inputWarning,
  } = usePlaygroundInputLifecycle({
    input: inputJs,
    saveInput: saveLastJs,
    toast,
  });

  useEffect(() => {
    void import("@/services/formatter/prettier");
    void import("@/services/js/transform");
  }, []);

  const validation = useJsParser(debouncedInputJs);

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
    inputJs,
    setInputJs,
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

  const { toolbarTools, toolbarConfig } = useToolbarConfig({
    mode: "js",
    handleFormat,
    handleMinify,
    handleExecute,
    formatConfig,
    setFormatConfig,
    minifyConfig,
    setMinifyConfig,
    modal: configModal,
  });

  return (
    <PlaygroundLayout
      editors={
        <JsEditors
          inputJs={inputJs}
          output={output}
          error={error}
          validationState={validation}
          inputWarning={inputWarning}
          onInputChange={setInputJs}
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
