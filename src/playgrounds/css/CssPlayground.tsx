import { Toolbar } from "@/components/layout/Toolbar";
import { PlaygroundLayout } from "@/components/layout/PlaygroundLayout";
import { CssEditors } from "./CssEditors";
import { cssPlaygroundConfig } from "./css.config";
import { useCssParser } from "@/hooks/useCssParser";
import { useCssPlaygroundActions } from "@/hooks/useCssPlaygroundActions";
import { usePlaygroundSetup, usePlaygroundToolbar } from "@/hooks/usePlaygroundSetup";
import { loadCssToolsConfig, loadLastCss, saveLastCss } from "@/services/storage";
import type { CssFormatConfig, CssMinifyConfig } from "@/types/css";
import { DEFAULT_CSS_FORMAT_CONFIG, DEFAULT_CSS_MINIFY_CONFIG } from "@/types/css";

const preload = () => {
  void import("@/services/formatter/prettier");
  void import("@/services/css/transform");
};

export function CssPlayground() {
  const ctx = usePlaygroundSetup<CssFormatConfig, CssMinifyConfig>({
    playgroundConfig: cssPlaygroundConfig,
    loadToolsConfig: loadCssToolsConfig,
    loadLastInput: loadLastCss,
    saveLastInput: saveLastCss,
    defaultFormatConfig: DEFAULT_CSS_FORMAT_CONFIG,
    defaultMinifyConfig: DEFAULT_CSS_MINIFY_CONFIG,
    preload,
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
  });

  return (
    <PlaygroundLayout
      editors={
        <CssEditors
          inputCss={ctx.input}
          output={ctx.output}
          error={ctx.error}
          validationState={validation}
          inputWarning={ctx.inputWarning}
          onInputChange={ctx.setInput}
          onClearInput={actions.handleClearInput}
          onLoadExample={actions.handleLoadExample}
          onCopyOutput={actions.handleCopyOutput}
          onDownloadInput={actions.handleDownloadInput}
          onDownloadOutput={actions.handleDownloadOutput}
        />
      }
      toolbar={<Toolbar variant="generic" tools={toolbarTools} config={toolbarConfig} />}
    />
  );
}
