/**
 * JSON Configuration Types
 * Centralized type definitions for JSON tool configurations
 */

import type { ConfigWithAutoCopy, PlaygroundToolsConfig } from "@/types/config";
import type { IndentStyle } from "@/types/format";

/**
 * Format configuration options
 */
export type FormatConfig = ConfigWithAutoCopy<{
  indent: IndentStyle;
  sortKeys: boolean;
}>;

/**
 * Minify configuration options
 */
export type MinifyConfig = ConfigWithAutoCopy<{
  removeSpaces: boolean;
  sortKeys: boolean;
}>;

/**
 * Clean configuration options
 */
export type CleanConfig = ConfigWithAutoCopy<{
  removeNull: boolean;
  removeUndefined: boolean;
  removeEmptyString: boolean;
  removeEmptyArray: boolean;
  removeEmptyObject: boolean;
  outputFormat: "format" | "minify";
}>;

/**
 * All tool configurations combined
 */
export type ToolsConfig = PlaygroundToolsConfig<{
  format: FormatConfig;
  minify: MinifyConfig;
  clean: CleanConfig;
}>;

/**
 * Default configuration values
 */
export const DEFAULT_FORMAT_CONFIG: FormatConfig = {
  indent: 2,
  sortKeys: false,
  autoCopy: false,
};

export const DEFAULT_MINIFY_CONFIG: MinifyConfig = {
  removeSpaces: true,
  sortKeys: false,
  autoCopy: false,
};

export const DEFAULT_CLEAN_CONFIG: CleanConfig = {
  removeNull: true,
  removeUndefined: true,
  removeEmptyString: true,
  removeEmptyArray: false,
  removeEmptyObject: false,
  outputFormat: "format",
  autoCopy: false,
};

export const DEFAULT_TOOLS_CONFIG: ToolsConfig = {
  format: DEFAULT_FORMAT_CONFIG,
  minify: DEFAULT_MINIFY_CONFIG,
  clean: DEFAULT_CLEAN_CONFIG,
};
