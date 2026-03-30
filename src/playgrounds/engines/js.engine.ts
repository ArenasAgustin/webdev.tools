import type { BaseActionsParams } from "./types";
import { useJsParser } from "@/hooks/useJsParser";
import { useJsPlaygroundActions } from "@/hooks/useJsPlaygroundActions";
import { DEFAULT_JS_FORMAT_CONFIG, DEFAULT_JS_MINIFY_CONFIG } from "@/types/js";
import { loadJsToolsConfig, loadLastJs, saveLastJs } from "@/services/storage";
import { jsPlaygroundConfig } from "../js/js.config";
import { formatJs, minifyJs } from "@/services/js/transform";

/**
 * Map generic params to JS-specific params
 */
function mapToJsParams(params: BaseActionsParams) {
  return {
    inputJs: params.input,
    setInputJs: params.setInput,
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
 * JavaScript Playground Engine Configuration
 */
export const jsEngine = {
  id: "js",
  config: jsPlaygroundConfig,
  editorLanguage: "javascript" as const,
  features: ["execute"] as const,
  defaultFormatConfig: DEFAULT_JS_FORMAT_CONFIG,
  defaultMinifyConfig: DEFAULT_JS_MINIFY_CONFIG,
  loadToolsConfig: loadJsToolsConfig,
  loadLastInput: loadLastJs,
  saveLastInput: saveLastJs,
  preload: () => {
    void import("@/services/formatter/prettier");
    void import("@/services/js/transform");
    void import("@/services/js/workerClient");
  },
  useParser: useJsParser,
  useActions: useJsPlaygroundActions,
  mapActionsParams: mapToJsParams,
  fileConfig: {
    inputFileName: "script.js",
    outputFileName: "result.js",
    mimeType: "text/javascript",
    language: "JavaScript",
    acceptExtensions: ".js,.ts,.mjs",
    exampleContent: jsPlaygroundConfig.example,
    formatRunner: formatJs,
    minifyRunner: minifyJs,
  },
};

// Type export for use
export type JsEngine = typeof jsEngine;
