import type { BaseActionsParams } from "./types";
import { usePhpParser } from "@/hooks/usePhpParser";
import { usePhpPlaygroundActions } from "@/hooks/usePhpPlaygroundActions";
import { DEFAULT_PHP_FORMAT_CONFIG } from "@/types/php";
import { loadPhpToolsConfig, loadLastPhp, saveLastPhp } from "@/services/storage";
import { phpPlaygroundConfig } from "../php/php.config";
import { formatPhp } from "@/services/php/transform";

/**
 * Map generic params to PHP-specific params
 */
function mapToPhpParams(params: BaseActionsParams) {
  return {
    inputPhp: params.input,
    setInputPhp: params.setInput,
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
 * PHP Playground Engine Configuration
 */
export const phpEngine = {
  id: "php",
  config: phpPlaygroundConfig,
  editorLanguage: "php" as const,
  features: ["validate"] as const,
  defaultFormatConfig: DEFAULT_PHP_FORMAT_CONFIG,
  defaultMinifyConfig: { autoCopy: false },
  loadToolsConfig: loadPhpToolsConfig,
  loadLastInput: loadLastPhp,
  saveLastInput: saveLastPhp,
  preload: () => {
    // PHP parser loads synchronously
    void import("@/services/php/transform");
  },
  useParser: usePhpParser,
  useActions: usePhpPlaygroundActions,
  mapActionsParams: mapToPhpParams,
  fileConfig: {
    inputFileName: "code.php",
    outputFileName: "result.php",
    mimeType: "application/x-php",
    language: "PHP",
    acceptExtensions: ".php",
    exampleContent: phpPlaygroundConfig.example,
    formatRunner: formatPhp,
    minifyRunner: async () => {
      throw new Error("Minify no está disponible para PHP");
    },
  },
};

// Type export for use
export type PhpEngine = typeof phpEngine;
