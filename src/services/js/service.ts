import type { JsonError } from "@/types/common";
import type { JsMinifyOptions } from "@/services/minifier/minifier";
import type { IndentStyle } from "@/types/format";
import type { PlaygroundTransformService } from "@/services/transform";
import { createNonEmptyValidator } from "@/services/transform";
import { formatJsAsync, minifyJsAsync } from "@/services/js/worker";

export interface JsFormatOptions {
  indentSize?: IndentStyle;
}

export const jsService: PlaygroundTransformService<JsFormatOptions, JsMinifyOptions, JsonError> = {
  format: (input, options = {}) => formatJsAsync(input, options.indentSize ?? 2),
  minify: (input, options = {}) => minifyJsAsync(input, options),
  validate: createNonEmptyValidator<JsonError>(() => ({ message: "No hay código para procesar" })),
};