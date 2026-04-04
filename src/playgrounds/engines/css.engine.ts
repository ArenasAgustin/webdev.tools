import type { BaseActionsParams } from "./types";
import { useCssParser } from "@/hooks/useCssParser";
import { useCssPlaygroundActions } from "@/hooks/useCssPlaygroundActions";
import {
  DEFAULT_CSS_FORMAT_CONFIG,
  DEFAULT_CSS_MINIFY_CONFIG,
  DEFAULT_CSS_CLEAN_CONFIG,
} from "@/types/css";
import { loadCssToolsConfig, loadLastCss, saveLastCss } from "@/services/storage";
import { cssPlaygroundConfig } from "../css/css.config";
import { formatCss, minifyCss } from "@/services/css/transform";

/**
 * Map generic params to CSS-specific params
 */
function mapToCssParams(params: BaseActionsParams) {
  return {
    inputCss: params.input,
    setInputCss: params.setInput,
    output: params.output,
    setOutput: params.setOutput,
    setError: params.setError,
    formatConfig: params.formatConfig,
    minifyConfig: params.minifyConfig,
    cleanConfig: params.cleanConfig,
    inputTooLarge: params.inputTooLarge,
    inputTooLargeMessage: params.inputTooLargeMessage,
    toast: params.toast,
  };
}

/**
 * CSS Playground Engine Configuration
 */
export const cssEngine = {
  id: "css",
  config: cssPlaygroundConfig,
  editorLanguage: "css" as const,
  features: ["clean", "minify"] as const,
  defaultFormatConfig: DEFAULT_CSS_FORMAT_CONFIG,
  defaultMinifyConfig: DEFAULT_CSS_MINIFY_CONFIG,
  cleanConfig: DEFAULT_CSS_CLEAN_CONFIG,
  loadToolsConfig: loadCssToolsConfig,
  loadLastInput: loadLastCss,
  saveLastInput: saveLastCss,
  preload: () => {
    void import("@/services/formatter/prettier");
    void import("@/services/css/transform");
    void import("@/services/css/workerClient");
  },
  useParser: useCssParser,
  useActions: useCssPlaygroundActions,
  mapActionsParams: mapToCssParams,
  fileConfig: {
    inputFileName: "styles.css",
    outputFileName: "result.css",
    mimeType: "text/css",
    language: "CSS",
    acceptExtensions: ".css",
    exampleContent: cssPlaygroundConfig.example,
    formatRunner: formatCss,
    minifyRunner: minifyCss,
  },
};

// Type export for use
export type CssEngine = typeof cssEngine;
