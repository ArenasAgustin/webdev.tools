import type { BaseActionsParams } from "./types";
import { useJsonParser } from "@/hooks/useJsonParser";
import { useJsonPlaygroundActions } from "@/hooks/useJsonPlaygroundActions";
import {
  DEFAULT_JSON_FORMAT_CONFIG,
  DEFAULT_JSON_MINIFY_CONFIG,
  DEFAULT_JSON_CLEAN_CONFIG,
} from "@/types/json";
import { loadJsonToolsConfig, loadLastJson, saveLastJson } from "@/services/storage";
import { jsonPlaygroundConfig } from "../json/json.config";
import { formatJson, minifyJson } from "@/services/json/transform";

/**
 * Extended params for JSON engine (includes JSONPath)
 */
interface JsonActionsParams extends BaseActionsParams {
  cleanConfig?: object;
  jsonPathExpression?: string;
  setJsonPathExpression?: (expr: string) => void;
  addToHistory?: (expr: string) => void;
}

/**
 * Map generic params to JSON-specific params
 */
function mapToJsonParams(params: JsonActionsParams) {
  return {
    inputJson: params.input,
    setInputJson: params.setInput,
    output: params.output,
    setOutput: params.setOutput,
    setError: params.setError,
    formatConfig: params.formatConfig,
    minifyConfig: params.minifyConfig,
    cleanConfig: params.cleanConfig,
    jsonPathExpression: params.jsonPathExpression,
    setJsonPathExpression: params.setJsonPathExpression,
    addToHistory: params.addToHistory,
    inputTooLarge: params.inputTooLarge,
    inputTooLargeMessage: params.inputTooLargeMessage,
    toast: params.toast,
  };
}

/**
 * JSON Playground Engine Configuration
 */
export const jsonEngine = {
  id: "json",
  config: jsonPlaygroundConfig,
  editorLanguage: "json" as const,
  features: ["clean", "jsonPath"] as const,
  defaultFormatConfig: DEFAULT_JSON_FORMAT_CONFIG,
  defaultMinifyConfig: DEFAULT_JSON_MINIFY_CONFIG,
  loadToolsConfig: loadJsonToolsConfig,
  loadLastInput: loadLastJson,
  saveLastInput: saveLastJson,
  preload: () => {
    void import("@/services/formatter/prettier");
    void import("@/services/json/transform");
    void import("@/services/json/workerClient");
  },
  useParser: useJsonParser,
  useActions: useJsonPlaygroundActions,
  mapActionsParams: mapToJsonParams,
  cleanConfig: DEFAULT_JSON_CLEAN_CONFIG,
  fileConfig: {
    inputFileName: "data.json",
    outputFileName: "result.json",
    mimeType: "application/json",
    language: "JSON",
    acceptExtensions: ".json",
    exampleContent: jsonPlaygroundConfig.example,
    formatRunner: formatJson,
    minifyRunner: minifyJson,
  },
};

// Type export for use
export type JsonEngine = typeof jsonEngine;
