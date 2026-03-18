import type { CssMinifyConfig } from "@/types/css";
import type { IndentStyle } from "@/types/format";
import { createPlaygroundService } from "@/services/transform";
import { formatCssAsync, minifyCssAsync } from "@/services/css/worker";

export type CssFormatOptions = IndentStyle;

export type CssMinifyOptions = Partial<Pick<CssMinifyConfig, "removeComments" | "removeSpaces">>;

export const cssService = createPlaygroundService<CssFormatOptions, CssMinifyOptions>({
  format: (input, indentSize) => formatCssAsync(input, indentSize ?? 2),
  minify: (input, options) => minifyCssAsync(input, options ?? {}),
  emptyMessage: "No hay CSS para procesar",
});
