import { createPlaygroundService } from "@/services/transform";
import type { JsFormatOptions, JsMinifyOptions } from "@/services/js/transform";
import { formatJsAsync, minifyJsAsync } from "@/services/js/worker";

export const jsService = createPlaygroundService<JsFormatOptions, JsMinifyOptions>({
  format: (input, options) => formatJsAsync(input, options?.indentSize ?? 2),
  minify: (input, options) => minifyJsAsync(input, options ?? {}),
  emptyMessage: "No hay código para procesar",
});
