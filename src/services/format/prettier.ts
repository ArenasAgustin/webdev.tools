import { format as prettierFormat } from "prettier/standalone";
import babelPlugin from "prettier/plugins/babel";
import estreePlugin from "prettier/plugins/estree";
import type { IndentStyle } from "@/types/format";

export type PrettierParser = "babel" | "json-stringify";

interface ResolveIndentResult {
  tabWidth: number;
  useTabs: boolean;
}

const resolveIndent = (indent: IndentStyle): ResolveIndentResult => {
  const useTabs = indent === "\t";
  return {
    useTabs,
    tabWidth: useTabs ? 2 : indent,
  };
};

export const formatWithPrettier = async (
  input: string,
  parser: PrettierParser,
  indent: IndentStyle = 2,
): Promise<string> => {
  const { tabWidth, useTabs } = resolveIndent(indent);

  const formatted = await prettierFormat(input, {
    parser,
    plugins: [babelPlugin, estreePlugin],
    tabWidth,
    useTabs,
  });

  return formatted.trimEnd();
};
