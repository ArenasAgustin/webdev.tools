import { createPlaygroundService } from "@/services/transform";
import type { PhpFormatOptions } from "@/services/php/transform";
import { formatPhp, validatePhp } from "@/services/php/transform";
import { serviceMessage } from "@/services/serviceMessage";

export const phpService = createPlaygroundService<PhpFormatOptions, never>({
  format: async (input, options) => {
    const result = formatPhp(input, options?.indentSize ?? 2);
    return result.ok ? result : { ok: false, error: { message: result.error } };
  },
  minify: async () => ({
    ok: false,
    error: { message: serviceMessage("services.php.minifyUnavailable") },
  }),
  emptyMessage: "services.common.noCode",
  validate: async (input) => validatePhp(input),
});
