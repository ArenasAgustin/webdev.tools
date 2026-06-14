import type { ReactNode } from "react";
import type { PlaygroundConfig } from "@/types/playground";
import type { ValidationState } from "@/hooks/useAsyncValidator";

/**
 * Playground mode - identifies which playground is active
 */
export type PlaygroundMode = "json" | "js" | "html" | "css" | "php" | "sql";

/**
 * Monaco editor language identifiers
 */
export type MonacoLanguage = "json" | "javascript" | "html" | "css" | "php" | "sql";

/**
 * Playground features - what special capabilities each playground supports
 */
export type PlaygroundFeature =
  | "clean" // JSON - has clean/format options
  | "execute" // JS - can execute code
  | "preview" // HTML - has live preview iframe
  | "jsonPath" // JSON - has JSONPath filtering
  | "validate" // PHP - has syntax validation
  | "minify"; // JSON, JS, HTML, CSS - has minify capability

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
 * Configuration types for format and minify runners
 * Using object type for flexibility with existing config types
 */
export type BaseFormatConfig = object;
export type BaseMinifyConfig = object;

/**
 * File configuration for downloads
 * Using flexible function types to accommodate different runner signatures
 */
export interface PlaygroundFileConfig {
  inputFileName: string;
  outputFileName: string;
  mimeType: string;
  language: string;
  acceptExtensions: string;
  exampleContent: string;
  // NOTE: `...args: any[]` is intentional. Each engine assigns a concrete
  // runner with a different required config param (HtmlFormatConfig,
  // CssMinifyConfig, php's no-arg minify, etc.). Narrowing the rest params to
  // `unknown[]` would break those assignments via parameter contravariance —
  // genericizing PlaygroundFileConfig is the only safe tightening and would
  // cascade across every engine. The return type IS tightened to `unknown`:
  // these fileConfig runners are never invoked for their value (only checked
  // as functions), so callers don't depend on the result type.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatRunner: (input: string, ...args: any[]) => unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  minifyRunner: (input: string, ...args: any[]) => unknown;
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
  cleanConfig?: object;
  inputTooLarge: boolean;
  inputTooLargeMessage: string;
  toast: PlaygroundToast;
}

/**
 * Engine-specific params passed to actions hook
 * Using object type - each engine defines its own param interface and maps accordingly
 */
export type EngineActionsParams = object;

/**
 * Render params passed to toolbar/output extras and modals
 */
export interface RenderParams {
  input: string;
  output: string;
  actions: PlaygroundActions;
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
  editorLanguage: MonacoLanguage;

  /** Features supported by this playground */
  features: readonly PlaygroundFeature[];

  /** Default format config */
  defaultFormatConfig: BaseFormatConfig;
  defaultMinifyConfig: BaseMinifyConfig;
  cleanConfig?: BaseFormatConfig;

  /** Storage functions */
  loadToolsConfig: () => { format?: object; minify?: object; clean?: object } | null;
  loadLastInput: () => string | null;
  saveLastInput: (value: string) => void;

  /** Preload function */
  preload: () => void;

  /** Parser hook */
  useParser: (input: string) => ValidationState;

  /**
   * Actions hook - returns the playground actions.
   * Written as a method signature (not a field) so it is checked bivariantly:
   * each engine assigns a hook with its own concrete params interface
   * (JsonActionsParams, HtmlActionsParams, ...). The params are the result of
   * `mapActionsParams`, so they are always an `EngineActionsParams` at the call
   * site — no `any` required.
   */
  useActions(params: EngineActionsParams): PlaygroundActions;

  /** Map generic params to engine-specific params */
  mapActionsParams: (params: BaseActionsParams) => EngineActionsParams;

  /** Extra toolbar content (JSONPath section, etc.) */
  renderToolbarExtra?: (params: RenderParams) => ReactNode;

  /** Extra output actions (preview button for HTML, etc.) */
  renderOutputActions?: (params: RenderParams) => ReactNode;

  /** Extra output panel (HTML preview iframe, etc.) */
  renderOutputPanel?: (props: OutputPanelProps) => ReactNode;

  /** Extra modals to render (TipsModal, JsonPathHistoryModal, etc.) */
  renderModals?: (params: RenderParams) => ReactNode[];

  /** Whether this engine has a config modal (shows the gear button in toolbar) */
  hasConfigModal?: boolean;

  /** File configuration for downloads */
  fileConfig: PlaygroundFileConfig;
}

/**
 * Playground Engine with clean config support (JSON only)
 */
export interface PlaygroundEngineWithClean extends PlaygroundEngine {
  /** Clean config defaults (JSON only) */
  cleanConfig: object;
}
