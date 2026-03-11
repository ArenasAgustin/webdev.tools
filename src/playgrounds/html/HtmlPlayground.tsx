import { Toolbar } from "@/components/layout/Toolbar";
import { PlaygroundLayout } from "@/components/layout/PlaygroundLayout";
import { HtmlEditors } from "./HtmlEditors";
import { htmlPlaygroundConfig } from "./html.config";
import { useHtmlParser } from "@/hooks/useHtmlParser";
import { useHtmlPlaygroundActions } from "@/hooks/useHtmlPlaygroundActions";
import { usePlaygroundSetup, usePlaygroundToolbar } from "@/hooks/usePlaygroundSetup";
import { loadLastHtml, saveLastHtml, loadHtmlToolsConfig } from "@/services/storage";
import type { HtmlFormatConfig, HtmlMinifyConfig } from "@/types/html";
import { DEFAULT_HTML_FORMAT_CONFIG, DEFAULT_HTML_MINIFY_CONFIG } from "@/types/html";

const preload = () => {
  void import("@/services/formatter/prettier");
  void import("@/services/html/transform");
};

export function HtmlPlayground() {
  const ctx = usePlaygroundSetup<HtmlFormatConfig, HtmlMinifyConfig>({
    playgroundConfig: htmlPlaygroundConfig,
    loadToolsConfig: loadHtmlToolsConfig,
    loadLastInput: loadLastHtml,
    saveLastInput: saveLastHtml,
    defaultFormatConfig: DEFAULT_HTML_FORMAT_CONFIG,
    defaultMinifyConfig: DEFAULT_HTML_MINIFY_CONFIG,
    preload,
  });

  const validation = useHtmlParser(ctx.debouncedInput);

  const actions = useHtmlPlaygroundActions({
    inputHtml: ctx.input,
    setInputHtml: ctx.setInput,
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
    mode: "html" as const,
    formatConfig: ctx.formatConfig,
    setFormatConfig: ctx.setFormatConfig,
    minifyConfig: ctx.minifyConfig,
    setMinifyConfig: ctx.setMinifyConfig,
  });

  return (
    <PlaygroundLayout
      editors={
        <HtmlEditors
          inputHtml={ctx.input}
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
