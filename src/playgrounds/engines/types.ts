import type { ReactNode } from "react";
import type { PlaygroundConfig } from "@/types/playground";
import type { ValidationState } from "@/hooks/useAsyncValidator";

/**
 * Playground features - what special capabilities each playground supports
 */
export type PlaygroundFeature =
  | "clean" // JSON - has clean/format options
  | "execute" // JS - can execute code
  | "preview" // HTML - has live preview iframe
  | "jsonPath"; // JSON - has JSONPath filtering

/**
 * Output panel props - passed to custom output panel renderers
 */
export interface OutputPanelProps {
  input: string;
  output: string;
  error: string | null;
  outputStats: { lines: number; characters: number; bytes: number };
  comparisonBytes: number;
  expandOutput: () => void;
  onCopyOutput: () => void;
  onDownloadOutput: () => void;
  onUseOutputAsInput?: () => void;
}

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatRunner: (input: string, config: any) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  minifyRunner: (input: string, config: any) => any;
}

/**
 * Base parameters for actions hooks - shared across all playgrounds
 */
export interface BaseActionsParams {
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

  /** Features supported by this playground */
  features: readonly PlaygroundFeature[];

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useActions: (params: any) => PlaygroundActions;

  /** Map generic params to engine-specific params */
  mapActionsParams: (params: BaseActionsParams) => unknown;

  /** Extra toolbar content (JSONPath section, etc.) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderToolbarExtra?: (params: any) => ReactNode;

  /** Extra output actions (preview button for HTML, etc.) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderOutputActions?: (params: any) => ReactNode;

  /** Extra output panel (HTML preview iframe, etc.) */
  renderOutputPanel?: (props: OutputPanelProps) => ReactNode;

  /** Extra modals to render (TipsModal, JsonPathHistoryModal, etc.) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderModals?: (params: any) => ReactNode[];

  /** File configuration for downloads */
  fileConfig: PlaygroundFileConfig;
}

/**
 * Playground Engine with clean config support (JSON only)
 */
export interface PlaygroundEngineWithClean extends PlaygroundEngine {
  /** Clean config defaults (JSON only) */
  cleanConfig: object;
  setCleanConfig: (config: object) => void;
}
