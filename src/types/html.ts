import type { ConfigWithAutoCopy, PlaygroundToolsConfig } from "@/types/config";
import type { IndentStyle } from "@/types/format";

export type HtmlFormatConfig = ConfigWithAutoCopy<{
  indentSize: IndentStyle;
  formatCss: boolean;
  formatJs: boolean;
}>;

export type HtmlMinifyConfig = ConfigWithAutoCopy<{
  removeComments: boolean;
  collapseWhitespace: boolean;
  minifyCss: boolean;
  minifyJs: boolean;
}>;

export type HtmlToolsConfig = PlaygroundToolsConfig<{
  format: HtmlFormatConfig;
  minify: HtmlMinifyConfig;
}>;

export const DEFAULT_HTML_FORMAT_CONFIG: HtmlFormatConfig = {
  indentSize: 2,
  formatCss: true,
  formatJs: true,
  autoCopy: false,
};

export const DEFAULT_HTML_MINIFY_CONFIG: HtmlMinifyConfig = {
  removeComments: true,
  collapseWhitespace: true,
  minifyCss: true,
  minifyJs: true,
  autoCopy: false,
};

export const DEFAULT_HTML_TOOLS_CONFIG: HtmlToolsConfig = {
  format: DEFAULT_HTML_FORMAT_CONFIG,
  minify: DEFAULT_HTML_MINIFY_CONFIG,
};
