import { Toolbar } from "@/components/layout/Toolbar";
import { PlaygroundLayout } from "@/components/layout/PlaygroundLayout";
import { GenericEditors } from "@/components/editor/GenericEditors";
import { jsPlaygroundConfig } from "./js.config";
import { useJsParser } from "@/hooks/useJsParser";
import { useJsPlaygroundActions } from "@/hooks/useJsPlaygroundActions";
import { usePlaygroundSetup, usePlaygroundToolbar } from "@/hooks/usePlaygroundSetup";
import { loadLastJs, saveLastJs, loadJsToolsConfig } from "@/services/storage";
import type { JsFormatConfig, JsMinifyConfig } from "@/types/js";
import { DEFAULT_JS_FORMAT_CONFIG, DEFAULT_JS_MINIFY_CONFIG } from "@/types/js";

const preload = () => {
  void import("@/services/formatter/prettier");
  void import("@/services/js/transform");
  void import("@/services/js/workerClient");
};

// Disable React Compiler optimization for this component due to dynamic code execution
/** @react-compiler-skip */

/**
 * JavaScript Playground - Execute and test JavaScript code
 */
export function JsPlayground() {
  const ctx = usePlaygroundSetup<JsFormatConfig, JsMinifyConfig>({
    playgroundConfig: jsPlaygroundConfig,
    loadToolsConfig: loadJsToolsConfig,
    loadLastInput: loadLastJs,
    saveLastInput: saveLastJs,
    defaultFormatConfig: DEFAULT_JS_FORMAT_CONFIG,
    defaultMinifyConfig: DEFAULT_JS_MINIFY_CONFIG,
    preload,
  });

  const validation = useJsParser(ctx.debouncedInput);

  const actions = useJsPlaygroundActions({
    inputJs: ctx.input,
    setInputJs: ctx.setInput,
    output: ctx.output,
    setOutput: ctx.setOutput,
    setError: ctx.setError,
    inputTooLarge: ctx.inputTooLarge,
    inputTooLargeMessage: ctx.inputTooLargeMessage,
    formatConfig: ctx.formatConfig,
    minifyConfig: ctx.minifyConfig,
    toast: ctx.toast,
  });

  const { toolbarTools, toolbarConfig } = usePlaygroundToolbar({
    handleFormat: actions.handleFormat,
    handleMinify: actions.handleMinify,
    handleExecute: actions.handleExecute,
    handleCopyOutput: actions.handleCopyOutput,
    handleClearInput: actions.handleClearInput,
    configModal: ctx.configModal,
    mode: "js" as const,
    formatConfig: ctx.formatConfig,
    setFormatConfig: ctx.setFormatConfig,
    minifyConfig: ctx.minifyConfig,
    setMinifyConfig: ctx.setMinifyConfig,
    isProcessing: actions.isProcessing,
  });

  return (
    <PlaygroundLayout
      editors={
        <GenericEditors
          input={ctx.input}
          output={ctx.output}
          error={ctx.error}
          validationState={validation}
          inputWarning={ctx.inputWarning}
          language="javascript"
          inputTitle="JavaScript"
          inputPlaceholder="Escribe tu código JavaScript aquí..."
          waitingLabel="Esperando JavaScript..."
          validLabel="JavaScript válido"
          invalidLabel="JavaScript inválido"
          onInputChange={ctx.setInput}
          onClearInput={actions.handleClearInput}
          onLoadExample={actions.handleLoadExample}
          onCopyOutput={actions.handleCopyOutput}
          onDownloadInput={actions.handleDownloadInput}
          onDownloadOutput={actions.handleDownloadOutput}
          isProcessing={actions.isProcessing}
        />
      }
      toolbar={<Toolbar variant="generic" tools={toolbarTools} config={toolbarConfig} />}
    />
  );
}
