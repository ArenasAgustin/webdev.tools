import type { ConfigWithAutoCopy, PlaygroundToolsConfig } from "@/types/config";
import type { IndentStyle } from "@/types/format";

export type JsFormatConfig = ConfigWithAutoCopy<{
  indentSize: IndentStyle;
}>;

export type JsMinifyConfig = ConfigWithAutoCopy<{
  removeComments: boolean;
  removeSpaces: boolean;
}>;

export type JsToolsConfig = PlaygroundToolsConfig<{
  format: JsFormatConfig;
  minify: JsMinifyConfig;
}>;

export const DEFAULT_JS_FORMAT_CONFIG: JsFormatConfig = {
  indentSize: 2,
  autoCopy: false,
};

export const DEFAULT_JS_MINIFY_CONFIG: JsMinifyConfig = {
  removeComments: true,
  removeSpaces: true,
  autoCopy: false,
};

export const DEFAULT_JS_TOOLS_CONFIG: JsToolsConfig = {
  format: DEFAULT_JS_FORMAT_CONFIG,
  minify: DEFAULT_JS_MINIFY_CONFIG,
};
