import { createPlaygroundService } from "@/services/transform";
import type { SqlFormatConfig, SqlMinifyConfig } from "@/types/sql";
import { formatSql, validateSql, minifySql } from "@/services/sql/transform";
import { DEFAULT_SQL_FORMAT_CONFIG } from "@/types/sql";

export const sqlService = createPlaygroundService<SqlFormatConfig, SqlMinifyConfig>({
  format: (input, options) => {
    const config = options ?? DEFAULT_SQL_FORMAT_CONFIG;
    const result = formatSql(input, config);
    return Promise.resolve(result.ok ? result : { ok: false, error: { message: result.error } });
  },
  minify: (input) => {
    const result = minifySql(input);
    return Promise.resolve(result.ok ? result : { ok: false, error: { message: result.error } });
  },
  emptyMessage: "No hay SQL para procesar",
  validate: (input) => {
    const result = validateSql(input);
    if (result.ok) {
      return Promise.resolve({ ok: true as const, value: undefined });
    }
    return Promise.resolve({ ok: false as const, error: result.error });
  },
});
