import type { Result } from "@/types/common";
import { formatWithPrettier } from "@/services/formatter/prettier";
import type { HtmlMinifyConfig } from "@/types/html";
import type { IndentStyle } from "@/types/format";
import { minifyJs } from "@/services/minifier/minifier";

export async function formatHtml(
  input: string,
  indentSize: IndentStyle = 2,
): Promise<Result<string, string>> {
  try {
    if (!input.trim()) {
      return { ok: true, value: "" };
    }

    const formatted = await formatWithPrettier(input, "html", indentSize);
    return { ok: true, value: formatted };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message };
  }
}

type HtmlMinifyOptions = Pick<
  HtmlMinifyConfig,
  "removeComments" | "collapseWhitespace" | "minifyCss" | "minifyJs"
>;

export function minifyHtml(input: string, options: HtmlMinifyOptions): Result<string, string> {
  try {
    if (!input.trim()) {
      return { ok: true, value: "" };
    }

    let minified = input;

    if (options.removeComments) {
      minified = minified.replace(/<!--(?!\[if\b)[\s\S]*?-->/g, "");
    }

    if (options.minifyCss) {
      minified = minified.replace(
        /<style(\b[^>]*)>([\s\S]*?)<\/style>/gi,
        (_: string, attrs: string, css: string) => {
          return `<style${attrs}>${minifyInlineCss(css)}</style>`;
        },
      );
    }

    if (options.minifyJs) {
      minified = minified.replace(
        /<script(\b[^>]*?)>([\s\S]*?)<\/script>/gi,
        (_, attrs: string, js: string) => {
          if (/\bsrc\s*=/.test(attrs)) {
            return `<script${attrs}></script>`;
          }

          const result = minifyJs(js, { removeComments: true, removeSpaces: true });
          if (!result.ok) {
            return `<script${attrs}>${js.trim()}</script>`;
          }

          return `<script${attrs}>${result.value}</script>`;
        },
      );
    }

    if (options.collapseWhitespace) {
      minified = minified
        .replace(/>\s+</g, "><")
        .replace(/\s{2,}/g, " ")
        .replace(/\n+/g, "");
    }

    return { ok: true, value: minified.trim() };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message };
  }
}

function minifyInlineCss(input: string): string {
  return input
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s*([{}:;,>])\s*/g, "$1")
    .replace(/;}/g, "}")
    .replace(/\s{2,}/g, " ")
    .trim();
}
