/**
 * JSON Configuration Types
 * Centralized type definitions for JSON tool configurations
 */

import type { ConfigWithAutoCopy, PlaygroundToolsConfig } from "@/types/config";
import type { IndentStyle } from "@/types/format";

/**
 * Format configuration options
 */
export type JsonFormatConfig = ConfigWithAutoCopy<{
  indent: IndentStyle;
  sortKeys: boolean;
}>;

/**
 * Minify configuration options
 */
export type JsonMinifyConfig = ConfigWithAutoCopy<{
  removeSpaces: boolean;
  sortKeys: boolean;
}>;

/**
 * Clean configuration options
 */
export type JsonCleanConfig = ConfigWithAutoCopy<{
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
export type JsonToolsConfig = PlaygroundToolsConfig<{
  format: JsonFormatConfig;
  minify: JsonMinifyConfig;
  clean: JsonCleanConfig;
}>;

/**
 * Default configuration values
 */
export const DEFAULT_JSON_FORMAT_CONFIG: JsonFormatConfig = {
  indent: 2,
  sortKeys: false,
  autoCopy: false,
};

export const DEFAULT_JSON_MINIFY_CONFIG: JsonMinifyConfig = {
  removeSpaces: true,
  sortKeys: false,
  autoCopy: false,
};

export const DEFAULT_JSON_CLEAN_CONFIG: JsonCleanConfig = {
  removeNull: true,
  removeUndefined: true,
  removeEmptyString: true,
  removeEmptyArray: false,
  removeEmptyObject: false,
  outputFormat: "format",
  autoCopy: false,
};

export const DEFAULT_JSON_TOOLS_CONFIG: JsonToolsConfig = {
  format: DEFAULT_JSON_FORMAT_CONFIG,
  minify: DEFAULT_JSON_MINIFY_CONFIG,
  clean: DEFAULT_JSON_CLEAN_CONFIG,
};
