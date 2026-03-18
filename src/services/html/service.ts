import type { HtmlMinifyConfig } from "@/types/html";
import type { IndentStyle } from "@/types/format";
import { createPlaygroundService } from "@/services/transform";
import { formatHtmlAsync, minifyHtmlAsync } from "@/services/html/worker";

export interface HtmlFormatOptions {
  indentSize?: IndentStyle;
  formatCss?: boolean;
  formatJs?: boolean;
}

export type HtmlMinifyOptions = Pick<
  HtmlMinifyConfig,
  "removeComments" | "collapseWhitespace" | "minifyCss" | "minifyJs"
>;

const DEFAULT_HTML_MINIFY_OPTIONS: HtmlMinifyOptions = {
  removeComments: true,
  collapseWhitespace: true,
  minifyCss: true,
  minifyJs: true,
};

export const htmlService = createPlaygroundService<HtmlFormatOptions, HtmlMinifyOptions>({
  format: (input, options) => formatHtmlAsync(input, options ?? {}),
  minify: (input, options) => minifyHtmlAsync(input, options ?? DEFAULT_HTML_MINIFY_OPTIONS),
  emptyMessage: "No hay HTML para procesar",
});
