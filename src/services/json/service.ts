import type { JsonError } from "@/types/common";
import type { FormatConfig, MinifyConfig } from "@/types/json";
import type { PlaygroundTransformService } from "@/services/transform";
import { formatJson } from "@/services/formatter/formatter";
import { minifyJson } from "@/services/minifier/minifier";
import { parseJson } from "@/services/json/parse";

export type JsonFormatOptions = Partial<Pick<FormatConfig, "indent" | "sortKeys">>;
export type JsonMinifyOptions = Partial<Pick<MinifyConfig, "removeSpaces" | "sortKeys">>;

export const jsonService: PlaygroundTransformService<JsonFormatOptions, JsonMinifyOptions, JsonError> = {
  format: (input, options = {}) => formatJson(input, options),
  minify: (input, options = {}) => minifyJson(input, options),
  validate: (input) => {
    const parsed = parseJson(input);
    if (!parsed.ok) {
      return parsed;
    }

    return { ok: true, value: undefined };
  },
};