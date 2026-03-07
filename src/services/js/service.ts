import type { PlaygroundTransformService } from "@/services/transform";
import { createNonEmptyValidator } from "@/services/transform";
import type { JsFormatOptions, JsMinifyOptions } from "@/services/js/transform";
import { formatJsAsync, minifyJsAsync } from "@/services/js/worker";

export const jsService: PlaygroundTransformService<JsFormatOptions, JsMinifyOptions, string> = {
  format: async (input, options = {}) => {
    const result = await formatJsAsync(input, options.indentSize ?? 2);
    return result.ok ? result : { ok: false, error: result.error.message };
  },
  minify: async (input, options = {}) => {
    const result = await minifyJsAsync(input, options);
    return result.ok ? result : { ok: false, error: result.error.message };
  },
  validate: createNonEmptyValidator(() => "No hay código para procesar"),
};
