import type { Result } from "@/types/common";
import { formatWithPrettier } from "@/services/formatter/prettier";
import { minifyCss } from "@/services/css/transform";
import { minifyJs } from "@/services/js/transform";
import type { HtmlMinifyConfig } from "@/types/html";
import type { IndentStyle } from "@/types/format";

interface HtmlFormatOptions {
  formatCss?: boolean;
  formatJs?: boolean;
}

export interface HtmlCleanOptions {
  removeEmptyTags?: boolean;
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

    let source = input;

    if (options.removeComments) {
      source = removeHtmlComments(source);
    }

    source = await minifyEmbeddedCss(source, {
      enabled: options.minifyCss,
      removeComments: options.removeComments,
    });

    source = minifyEmbeddedJs(source, {
      enabled: options.minifyJs,
      removeComments: options.removeComments,
    });

    if (options.collapseWhitespace) {
      source = collapseHtmlWhitespace(source);
    }

    return { ok: true, value: source.trim() };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message };
  }
}

function removeHtmlComments(source: string): string {
  return source.replace(/<!--[\s\S]*?-->/g, (comment) =>
    isConditionalComment(comment) ? comment : "",
  );
}

function isConditionalComment(comment: string): boolean {
  return /^<!--\s*\[if[\s\S]*?<!\[endif\]\s*-->$/i.test(comment.trim());
}

async function minifyEmbeddedCss(
  source: string,
  options: { enabled: boolean; removeComments: boolean },
): Promise<string> {
  const stylePattern = /<style(\b[^>]*)>([\s\S]*?)<\/style>/gi;

  let result = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = stylePattern.exec(source)) !== null) {
    const [fullMatch, attrs, content] = match;
    result += source.slice(lastIndex, match.index);

    if (!options.enabled) {
      result += fullMatch;
      lastIndex = stylePattern.lastIndex;
      continue;
    }

    const minifiedCss = await minifyCss(content, {
      removeComments: options.removeComments,
      removeSpaces: true,
    });

    const nextContent = minifiedCss.ok ? minifiedCss.value : content;
    result += `<style${attrs}>${nextContent}</style>`;
    lastIndex = stylePattern.lastIndex;
  }

  result += source.slice(lastIndex);
  return result;
}

function minifyEmbeddedJs(
  source: string,
  options: { enabled: boolean; removeComments: boolean },
): string {
  const scriptPattern = /<script(\b[^>]*)>([\s\S]*?)<\/script>/gi;

  return source.replace(scriptPattern, (fullMatch, attrs: string, content: string) => {
    if (!options.enabled) {
      return fullMatch;
    }

    if (/\bsrc\s*=\s*/i.test(attrs)) {
      return fullMatch;
    }

    const minifiedJs = minifyJs(content, {
      removeComments: options.removeComments,
      removeSpaces: true,
    });

    const nextContent = minifiedJs.ok ? minifiedJs.value.replace(/;\s*$/, "") : content;
    return `<script${attrs}>${nextContent}</script>`;
  });
}

function collapseHtmlWhitespace(source: string): string {
  const preservedBlocks = new Map<string, string>();
  let output = preserveEmbeddedTagContent(source, "style", preservedBlocks);
  output = preserveEmbeddedTagContent(output, "script", preservedBlocks);

  output = output.replace(/>\s+</g, "><");
  output = output.replace(/>([^<]*)</g, (_match, text: string) => {
    const normalizedText = text.replace(/\s+/g, " ").trim();
    return normalizedText.length > 0 ? `>${normalizedText}<` : "><";
  });

  output = restorePreservedContent(output, preservedBlocks);
  output = trimEmbeddedTagContent(output, "style");
  output = trimEmbeddedTagContent(output, "script");
  return output;
}

function trimEmbeddedTagContent(source: string, tagName: "style" | "script"): string {
  const pattern = new RegExp(`<${tagName}(\\b[^>]*)>([\\s\\S]*?)<\\/${tagName}>`, "gi");

  return source.replace(pattern, (_match, attrs: string, content: string) => {
    return `<${tagName}${attrs}>${content.trim()}</${tagName}>`;
  });
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

const HTML_ERROR_MESSAGES = {
  EMPTY_INPUT: "El HTML está vacío",
} as const;

/**
 * Tags that should be preserved even if empty (they have semantic meaning)
 */
const PRESERVED_EMPTY_TAGS = [
  "script",
  "style",
  "pre",
  "textarea",
  "iframe",
  "canvas",
  "svg",
  "math",
];

/**
 * Clean empty HTML tags
 * Pure function - no side effects
 */
export function cleanHtml(input: string, options: HtmlCleanOptions = {}): Result<string, string> {
  if (!input.trim()) {
    return {
      ok: false,
      error: HTML_ERROR_MESSAGES.EMPTY_INPUT,
    };
  }

  const opts = {
    removeEmptyTags: options?.removeEmptyTags ?? true,
  };

  try {
    let result = input;

    if (opts.removeEmptyTags) {
      // Preserve script, style, pre, textarea blocks by replacing with tokens
      const preservedBlocks = new Map<string, string>();
      let index = 0;

      for (const tagName of PRESERVED_EMPTY_TAGS) {
        const pattern = new RegExp(`<${tagName}(\\b[^>]*)>[\\s\\S]*?</${tagName}>`, "gi");
        result = result.replace(pattern, (match) => {
          const token = `__WEBDEVTOOLS_PRESERVE_${tagName.toUpperCase()}_${index}__`;
          index++;
          preservedBlocks.set(token, match);
          return token;
        });
      }

      // Remove empty tags: <tag></tag> or <tag />
      // Match opening tag followed by optional whitespace and closing tag or self-closing
      result = result.replace(/<(\w+)([^>]*?)\s*>\s*<\/\1>/g, "");
      result = result.replace(/<(\w+)([^>]*?)\s*\/\s*>/g, "");

      // Restore preserved blocks
      for (const [token, content] of preservedBlocks.entries()) {
        result = result.replace(token, content);
      }
    }

    // Clean up multiple newlines and trim
    result = result.replace(/\n{3,}/g, "\n\n");
    result = result.trim();

    return { ok: true, value: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: `Error al limpiar HTML: ${message}` };
  }
}
