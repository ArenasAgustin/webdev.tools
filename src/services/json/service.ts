import type { PlaygroundTransformService } from "@/services/transform";
import type { JsonFormatOptions, JsonMinifyOptions } from "@/services/json/transform";
import { formatJsonAsync, minifyJsonAsync } from "@/services/json/worker";
import { parseJson } from "@/services/json/transform";

export const jsonService: PlaygroundTransformService<JsonFormatOptions, JsonMinifyOptions, string> = {
  format: async (input, options = {}) => {
    const result = await formatJsonAsync(input, options);
    return result.ok ? result : { ok: false, error: result.error.message };
  },
  minify: async (input, options = {}) => {
    const result = await minifyJsonAsync(input, options);
    return result.ok ? result : { ok: false, error: result.error.message };
  },
  validate: (input) => {
    if (!input.trim()) {
      return { ok: false, error: "No hay JSON para procesar" };
    }

    const parsed = parseJson(input);
    if (!parsed.ok) {
      return { ok: false, error: parsed.error.message };
    }

    return { ok: true, value: undefined };
  },
};