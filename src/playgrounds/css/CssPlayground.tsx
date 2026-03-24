import { Toolbar } from "@/components/layout/Toolbar";
import { PlaygroundLayout } from "@/components/layout/PlaygroundLayout";
import { GenericEditors } from "@/components/editor/GenericEditors";
import { cssPlaygroundConfig } from "./css.config";
import { useCssParser } from "@/hooks/useCssParser";
import { useCssPlaygroundActions } from "@/hooks/useCssPlaygroundActions";
import { usePlaygroundSetup, usePlaygroundToolbar } from "@/hooks/usePlaygroundSetup";
import { usePlaygroundOverlays } from "@/hooks/usePlaygroundOverlays";
import { loadCssToolsConfig, loadLastCss, saveLastCss } from "@/services/storage";
import type { CssFormatConfig, CssMinifyConfig } from "@/types/css";
import { DEFAULT_CSS_FORMAT_CONFIG, DEFAULT_CSS_MINIFY_CONFIG } from "@/types/css";

const preload = () => {
  void import("@/services/formatter/prettier");
  void import("@/services/css/transform");
  void import("@/services/css/workerClient");
};

export function CssPlayground() {
  const overlays = usePlaygroundOverlays();
  const ctx = usePlaygroundSetup<CssFormatConfig, CssMinifyConfig>({
    playgroundConfig: cssPlaygroundConfig,
    loadToolsConfig: loadCssToolsConfig,
    loadLastInput: loadLastCss,
    saveLastInput: saveLastCss,
    defaultFormatConfig: DEFAULT_CSS_FORMAT_CONFIG,
    defaultMinifyConfig: DEFAULT_CSS_MINIFY_CONFIG,
    preload,
    configModal: overlays.config,
  });

  const validation = useCssParser(ctx.debouncedInput);

  const actions = useCssPlaygroundActions({
    inputCss: ctx.input,
    setInputCss: ctx.setInput,
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
    handleCopyOutput: actions.handleCopyOutput,
    handleClearInput: actions.handleClearInput,
    configModal: ctx.configModal,
    mode: "css" as const,
    formatConfig: ctx.formatConfig,
    setFormatConfig: ctx.setFormatConfig,
    minifyConfig: ctx.minifyConfig,
    setMinifyConfig: ctx.setMinifyConfig,
    isProcessing: actions.isProcessing,
    onOpenShortcuts: overlays.shortcuts.open,
    onOpenDiff: overlays.diff.open,
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
          language="css"
          inputTitle="CSS"
          inputPlaceholder="Escribe tu CSS aquí..."
          waitingLabel="Esperando CSS..."
          validLabel="CSS válido"
          invalidLabel="CSS inválido"
          onInputChange={ctx.setInput}
          onClearInput={actions.handleClearInput}
          onLoadExample={actions.handleLoadExample}
          onCopyOutput={actions.handleCopyOutput}
          onDownloadInput={actions.handleDownloadInput}
          onDownloadOutput={actions.handleDownloadOutput}
          isProcessing={actions.isProcessing}
          onUseOutputAsInput={actions.handleUseOutputAsInput}
          onUseInputAsOutput={actions.handleUseInputAsOutput}
          diffModal={overlays.diff}
          editorState={overlays.editor}
        />
      }
      toolbar={<Toolbar variant="generic" tools={toolbarTools} config={toolbarConfig} shortcuts={overlays.shortcuts} />}
    />
  );
}
