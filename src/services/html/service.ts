import type { HtmlMinifyConfig } from "@/types/html";
import type { IndentStyle } from "@/types/format";
import type { PlaygroundTransformService } from "@/services/transform";
import { createNonEmptyValidator } from "@/services/transform";
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

export const htmlService: PlaygroundTransformService<HtmlFormatOptions, HtmlMinifyOptions, string> = {
  format: async (input, options = {}) => {
    const result = await formatHtmlAsync(input, {
      indentSize: options.indentSize,
      formatCss: options.formatCss,
      formatJs: options.formatJs,
    });

    return result.ok ? result : { ok: false, error: result.error.message };
  },
  minify: async (
    input,
    options = { removeComments: true, collapseWhitespace: true, minifyCss: true, minifyJs: true },
  ) => {
    const result = await minifyHtmlAsync(input, options);
    return result.ok ? result : { ok: false, error: result.error.message };
  },
  validate: createNonEmptyValidator(() => "No hay HTML para procesar"),
};