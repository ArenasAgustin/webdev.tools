import type { ReactNode } from "react";
import type { PlaygroundConfig } from "@/types/playground";
import type { ValidationState } from "@/hooks/useAsyncValidator";

/**
 * Playground Actions return type - shared across all playgrounds
 */
export interface PlaygroundActions {
  handleFormat: () => void;
  handleMinify: () => void;
  handleClean?: () => void;
  handleExecute?: () => void;
  handleCopyOutput: () => void;
  handleClearInput: () => void;
  handleLoadExample: () => void;
  handleDownloadInput: () => void;
  handleDownloadOutput: () => void;
  handleUseInputAsOutput?: () => void;
  handleUseOutputAsInput?: () => void;
  handleApplyJsonPath?: () => void;
  handleReuseFromHistory?: (expr: string) => void;
  handleImportFile?: (file: File) => void;
  acceptExtensions?: string;
  isProcessing: boolean;
}

/**
 * Toast interface
 */
export interface PlaygroundToast {
  success: (message: string) => void;
  error: (message: string) => void;
}

/**
 * Parameters passed to the useParser hook
 */
export interface UseParserParams {
  input: string;
}

/**
 * Parameters passed to the useActions hook
 */
export interface UseActionsParams {
  input: string;
  setInput: (value: string) => void;
  output: string;
  setOutput: (value: string) => void;
  setError: (error: string | null) => void;
  formatConfig: object;
  minifyConfig: object;
  inputTooLarge: boolean;
  inputTooLargeMessage: string;
  toast: PlaygroundToast;
  // JSON-specific
  jsonPathExpression?: string;
  setJsonPathExpression?: (expr: string) => void;
  addToHistory?: (expr: string) => void;
  cleanConfig?: object;
}

/**
 * File configuration for downloads
 */
export interface PlaygroundFileConfig {
  inputFileName: string;
  outputFileName: string;
  mimeType: string;
  language: string;
  acceptExtensions: string;
  exampleContent: string;
  formatRunner: (input: string, config: object) => Promise<string>;
  minifyRunner: (input: string, config: object) => Promise<string>;
}

/**
 * Playground Engine interface
 * Each playground implements this interface to define its behavior
 */
export interface PlaygroundEngine {
  /** Unique identifier */
  id: string;

  /** Playground configuration */
  config: PlaygroundConfig;

  /** Monaco editor language */
  editorLanguage: "json" | "javascript" | "html" | "css";

  /** Default format config */
  defaultFormatConfig: object;
  defaultMinifyConfig: object;

  /** Storage functions */
  loadToolsConfig: () => { format?: object; minify?: object; clean?: object } | null;
  loadLastInput: () => string | null;
  saveLastInput: (value: string) => void;

  /** Preload function */
  preload: () => void;

  /** Parser hook */
  useParser: (input: string) => ValidationState;

  /** Actions hook - returns the playground actions */
  useActions: (params: UseActionsParams) => PlaygroundActions;

  /** Optional clean config (JSON only) */
  cleanConfig?: object;
  setCleanConfig?: (config: object) => void;

  /** Extra toolbar content (JSONPath section, etc.) */
  extraToolbarContent?: ReactNode;

  /** Extra modals to render */
  extraModals?: ReactNode[];

  /** File configuration for downloads */
  fileConfig: PlaygroundFileConfig;
}
