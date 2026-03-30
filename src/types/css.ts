import type { ConfigWithAutoCopy, PlaygroundToolsConfig } from "@/types/config";
import type { IndentStyle } from "@/types/format";

export type CssFormatConfig = ConfigWithAutoCopy<{
  indentSize: IndentStyle;
}>;

export type CssMinifyConfig = ConfigWithAutoCopy<{
  removeComments: boolean;
  removeSpaces: boolean;
}>;

export type CssCleanConfig = ConfigWithAutoCopy<{
  removeEmptyRules: boolean;
  removeRulesWithOnlyComments: boolean;
}>;

export type CssToolsConfig = PlaygroundToolsConfig<{
  format: CssFormatConfig;
  minify: CssMinifyConfig;
  clean: CssCleanConfig;
}>;

export const DEFAULT_CSS_FORMAT_CONFIG: CssFormatConfig = {
  indentSize: 2,
  autoCopy: false,
};

export const DEFAULT_CSS_MINIFY_CONFIG: CssMinifyConfig = {
  removeComments: true,
  removeSpaces: true,
  autoCopy: false,
};

export const DEFAULT_CSS_CLEAN_CONFIG: CssCleanConfig = {
  removeEmptyRules: true,
  removeRulesWithOnlyComments: true,
  autoCopy: false,
};

export const DEFAULT_CSS_TOOLS_CONFIG: CssToolsConfig = {
  format: DEFAULT_CSS_FORMAT_CONFIG,
  minify: DEFAULT_CSS_MINIFY_CONFIG,
  clean: DEFAULT_CSS_CLEAN_CONFIG,
};
