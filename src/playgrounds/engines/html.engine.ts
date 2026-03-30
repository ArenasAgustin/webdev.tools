import type { BaseActionsParams } from "./types";
import { useHtmlParser } from "@/hooks/useHtmlParser";
import { useHtmlPlaygroundActions } from "@/hooks/useHtmlPlaygroundActions";
import { DEFAULT_HTML_FORMAT_CONFIG, DEFAULT_HTML_MINIFY_CONFIG } from "@/types/html";
import { loadHtmlToolsConfig, loadLastHtml, saveLastHtml } from "@/services/storage";
import { htmlPlaygroundConfig } from "../html/html.config";
import { formatHtml, minifyHtml } from "@/services/html/transform";

/**
 * Map generic params to HTML-specific params
 */
function mapToHtmlParams(params: BaseActionsParams) {
  return {
    inputHtml: params.input,
    setInputHtml: params.setInput,
    output: params.output,
    setOutput: params.setOutput,
    setError: params.setError,
    formatConfig: params.formatConfig,
    minifyConfig: params.minifyConfig,
    inputTooLarge: params.inputTooLarge,
    inputTooLargeMessage: params.inputTooLargeMessage,
    toast: params.toast,
  };
}

/**
 * HTML Playground Engine Configuration
 */
export const htmlEngine = {
  id: "html",
  config: htmlPlaygroundConfig,
  editorLanguage: "html" as const,
  features: ["preview"] as const,
  defaultFormatConfig: DEFAULT_HTML_FORMAT_CONFIG,
  defaultMinifyConfig: DEFAULT_HTML_MINIFY_CONFIG,
  loadToolsConfig: loadHtmlToolsConfig,
  loadLastInput: loadLastHtml,
  saveLastInput: saveLastHtml,
  preload: () => {
    void import("@/services/formatter/prettier");
    void import("@/services/html/transform");
    void import("@/services/html/workerClient");
  },
  useParser: useHtmlParser,
  useActions: useHtmlPlaygroundActions,
  mapActionsParams: mapToHtmlParams,
  fileConfig: {
    inputFileName: "index.html",
    outputFileName: "result.html",
    mimeType: "text/html",
    language: "HTML",
    acceptExtensions: ".html,.htm",
    exampleContent: htmlPlaygroundConfig.example,
    formatRunner: formatHtml,
    minifyRunner: minifyHtml,
  },
};

// Type export for use
export type HtmlEngine = typeof htmlEngine;
