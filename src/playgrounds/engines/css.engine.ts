import { useCssParser } from "@/hooks/useCssParser";
import { useCssPlaygroundActions } from "@/hooks/useCssPlaygroundActions";
import { DEFAULT_CSS_FORMAT_CONFIG, DEFAULT_CSS_MINIFY_CONFIG } from "@/types/css";
import { loadCssToolsConfig, loadLastCss, saveLastCss } from "@/services/storage";
import { cssPlaygroundConfig } from "../css/css.config";
import { formatCss, minifyCss } from "@/services/css/transform";

/**
 * CSS Playground Engine Configuration
 */
export const cssEngine = {
  id: "css",
  config: cssPlaygroundConfig,
  editorLanguage: "css" as const,
  defaultFormatConfig: DEFAULT_CSS_FORMAT_CONFIG,
  defaultMinifyConfig: DEFAULT_CSS_MINIFY_CONFIG,
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
