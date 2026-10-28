import type { BaseActionsParams } from "./types";
import { usePhpParser } from "@/hooks/usePhpParser";
import { usePhpPlaygroundActions } from "@/hooks/usePhpPlaygroundActions";
import { DEFAULT_PHP_FORMAT_CONFIG } from "@/types/php";
import { loadPhpToolsConfig, loadLastPhp, saveLastPhp } from "@/services/storage";
import { phpFileSettings, phpPlaygroundConfig } from "../php/php.config";
import { formatPhp } from "@/services/php/transform";
import { translate } from "@/i18n/translate";

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
  features: ["validate", "execute"] as const,
  defaultFormatConfig: DEFAULT_PHP_FORMAT_CONFIG,
  defaultMinifyConfig: { autoCopy: false },
  loadToolsConfig: loadPhpToolsConfig,
  loadLastInput: loadLastPhp,
  saveLastInput: saveLastPhp,
  hasConfigModal: true,
  preload: () => {
    // Lazy: only import the module, don't load php-wasm until needed
    // php-wasm (~15MB) loads lazily on first format/execute call
    void import("@/services/php/transform");
    void import("@/services/php/phpWasmLoader");
  },
  useParser: usePhpParser,
  useActions: usePhpPlaygroundActions,
  mapActionsParams: mapToPhpParams,
  fileConfig: {
    ...phpFileSettings,
    language: "PHP",
    exampleContent: phpPlaygroundConfig.example,
    formatRunner: formatPhp,
    minifyRunner: async () => {
      throw new Error(translate("messages.php.minifyUnavailable"));
    },
  },
};

// Type export for use
export type PhpEngine = typeof phpEngine;
