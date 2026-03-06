import type { CssMinifyConfig } from "@/types/css";
import type { IndentStyle } from "@/types/format";
import type { PlaygroundTransformService } from "@/services/transform";
import { createNonEmptyValidator } from "@/services/transform";
import { formatCssAsync, minifyCssAsync } from "@/services/css/worker";

export type CssFormatOptions = IndentStyle;

export type CssMinifyOptions = Partial<Pick<CssMinifyConfig, "removeComments" | "removeSpaces">>;

export const cssService: PlaygroundTransformService<CssFormatOptions, CssMinifyOptions, string> = {
  format: async (input, indentSize = 2) => {
    const result = await formatCssAsync(input, indentSize);
    return result.ok ? result : { ok: false, error: result.error.message };
  },
  minify: async (input, options = {}) => {
    const result = await minifyCssAsync(input, options);
    return result.ok ? result : { ok: false, error: result.error.message };
  },
  validate: createNonEmptyValidator(() => "No hay CSS para procesar"),
};