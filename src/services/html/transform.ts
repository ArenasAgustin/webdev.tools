import type { Result } from "@/types/common";
import { formatWithPrettier } from "@/services/formatter/prettier";
import type { HtmlMinifyConfig } from "@/types/html";
import type { IndentStyle } from "@/types/format";
import { minify as minifyHtmlWithTerser } from "html-minifier-terser";

interface HtmlFormatOptions {
  formatCss?: boolean;
  formatJs?: boolean;
}

export async function formatHtml(
  input: string,
  indentSize: IndentStyle = 2,
  options: HtmlFormatOptions = {},
): Promise<Result<string, string>> {
  try {
    if (!input.trim()) {
      return { ok: true, value: "" };
    }

    const formatCss = options.formatCss ?? true;
    const formatJs = options.formatJs ?? true;

    let source = input;
    const preservedBlocks = new Map<string, string>();

    if (!formatCss) {
      source = preserveEmbeddedTagContent(source, "style", preservedBlocks);
    }

    if (!formatJs) {
      source = preserveEmbeddedTagContent(source, "script", preservedBlocks);
    }

    const formatted = await formatWithPrettier(source, "html", indentSize);
    return { ok: true, value: restorePreservedContent(formatted, preservedBlocks) };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message };
  }
}

type HtmlMinifyOptions = Pick<
  HtmlMinifyConfig,
  "removeComments" | "collapseWhitespace" | "minifyCss" | "minifyJs"
>;

export async function minifyHtml(
  input: string,
  options: HtmlMinifyOptions,
): Promise<Result<string, string>> {
  try {
    if (!input.trim()) {
      return { ok: true, value: "" };
    }

    const minified = await minifyHtmlWithTerser(input, {
      removeComments: options.removeComments,
      collapseWhitespace: options.collapseWhitespace,
      minifyCSS: options.minifyCss,
      minifyJS: options.minifyJs,
      keepClosingSlash: true,
      continueOnParseError: true,
    });

    return { ok: true, value: minified.trim() };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message };
  }
}

function preserveEmbeddedTagContent(
  source: string,
  tagName: "style" | "script",
  preservedBlocks: Map<string, string>,
): string {
  let index = 0;
  const pattern = new RegExp(`<${tagName}(\\b[^>]*)>([\\s\\S]*?)<\\/${tagName}>`, "gi");

  return source.replace(pattern, (_match: string, attrs: string, content: string) => {
    const token = `__WEBDEVTOOLS_PRESERVE_${tagName.toUpperCase()}_${index}__`;
    index += 1;
    preservedBlocks.set(token, content);
    return `<${tagName}${attrs}>${token}</${tagName}>`;
  });
}

function restorePreservedContent(source: string, preservedBlocks: Map<string, string>): string {
  let output = source;

  for (const [token, content] of preservedBlocks.entries()) {
    output = output.replace(new RegExp(escapeRegExp(token), "g"), content);
  }

  return output;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
