export interface JsFormatConfig {
  indentSize: number;
  autoCopy: boolean;
}

export interface JsMinifyConfig {
  removeComments: boolean;
  removeSpaces: boolean;
  autoCopy: boolean;
}

export interface JsToolsConfig {
  format: JsFormatConfig;
  minify: JsMinifyConfig;
}

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
