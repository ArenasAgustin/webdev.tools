import { createPlaygroundService } from "@/services/transform";
import type { JsonFormatOptions, JsonMinifyOptions } from "@/services/json/transform";
import { formatJsonAsync, minifyJsonAsync } from "@/services/json/worker";
import { parseJson } from "@/services/json/transform";
import { serviceMessage } from "@/services/serviceMessage";

export const jsonService = createPlaygroundService<JsonFormatOptions, JsonMinifyOptions>({
  format: (input, options) => formatJsonAsync(input, options ?? {}),
  minify: (input, options) => minifyJsonAsync(input, options ?? {}),
  emptyMessage: "services.json.noInput",
  validate: (input) => {
    if (!input.trim()) {
      return { ok: false, error: serviceMessage("services.json.noInput") };
    }

    const parsed = parseJson(input);
    if (!parsed.ok) {
      return { ok: false, error: parsed.error.message };
    }

    return { ok: true, value: undefined };
  },
});
