import type { ConfigWithAutoCopy, PlaygroundToolsConfig } from "@/types/config";
import type { IndentStyle } from "@/types/format";

export type PhpFormatConfig = ConfigWithAutoCopy<{
  indentSize: IndentStyle;
}>;

export type PhpToolsConfig = PlaygroundToolsConfig<{
  format: PhpFormatConfig;
}>;

export const DEFAULT_PHP_FORMAT_CONFIG: PhpFormatConfig = {
  indentSize: 2,
  autoCopy: false,
};
