import { createPlaygroundService } from "@/services/transform";
import type { PhpFormatOptions } from "@/services/php/transform";
import { formatPhp, validatePhp } from "@/services/php/transform";

export const phpService = createPlaygroundService<PhpFormatOptions, never>({
  format: async (input, options) => {
    const result = formatPhp(input, options?.indentSize ?? 2);
    return result.ok ? result : { ok: false, error: { message: result.error } };
  },
  minify: async () => ({
    ok: false,
    error: { message: "Minify no está disponible para PHP" },
  }),
  emptyMessage: "No hay código para procesar",
  validate: async (input) => validatePhp(input),
});
