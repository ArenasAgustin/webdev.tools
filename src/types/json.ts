/**
 * JSON Configuration Types
 * Centralized type definitions for JSON tool configurations
 */

/**
 * Format configuration options
 */
export interface FormatConfig {
  indent: number | "\t";
  sortKeys: boolean;
  autoCopy: boolean;
}

/**
 * Minify configuration options
 */
export interface MinifyConfig {
  removeSpaces: boolean;
  sortKeys: boolean;
  autoCopy: boolean;
}

/**
 * Clean configuration options
 */
export interface CleanConfig {
  removeNull: boolean;
  removeUndefined: boolean;
  removeEmptyString: boolean;
  removeEmptyArray: boolean;
  removeEmptyObject: boolean;
  outputFormat: "format" | "minify";
  autoCopy: boolean;
}

/**
 * All tool configurations combined
 */
export interface ToolsConfig {
  format: FormatConfig;
  minify: MinifyConfig;
  clean: CleanConfig;
}

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
