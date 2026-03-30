import type { Result } from "@/types/common";
import type { IndentStyle } from "@/types/format";
import { formatWithPrettier } from "@/services/formatter/prettier";
import { minify_sync as terserMinifySync } from "terser";

export interface JsFormatOptions {
  indentSize?: IndentStyle;
}

export interface JsMinifyOptions {
  removeComments?: boolean;
  removeSpaces?: boolean;
}

export interface JsCleanOptions {
  removeEmptyObject?: boolean;
  removeEmptyArray?: boolean;
  removeEmptyFunction?: boolean;
  removeEmptyString?: boolean;
}

interface TerserSyncResult {
  code?: string;
}

type TerserSyncMinifyFn = (
  input: string,
  options: {
    compress: boolean;
    mangle: boolean;
    format: {
      comments: boolean;
      beautify: boolean;
    };
  },
) => TerserSyncResult | null | undefined;

export async function formatJs(
  input: string,
  indentSize: IndentStyle = 2,
): Promise<Result<string, string>> {
  try {
    if (!input.trim()) {
      return { ok: true, value: "" };
    }

    const formatted = await formatWithPrettier(input, "babel", indentSize);
    return { ok: true, value: formatted };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message || "Error al formatear código" };
  }
}

export function minifyJs(input: string, options: JsMinifyOptions = {}): Result<string, string> {
  try {
    if (!input.trim()) {
      return { ok: true, value: "" };
    }

    const { removeComments = true, removeSpaces = true } = options;

    const minifySyncUnknown: unknown = terserMinifySync;
    if (typeof minifySyncUnknown !== "function") {
      return { ok: false, error: "Terser minify no está disponible" };
    }

    const minifySync = minifySyncUnknown as TerserSyncMinifyFn;

    const result = minifySync(input, {
      compress: removeSpaces,
      mangle: removeSpaces,
      format: {
        comments: !removeComments,
        beautify: !removeSpaces,
      },
    });

    const code = typeof result?.code === "string" ? result.code : "";
    return { ok: true, value: code.trim() };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message };
  }
}

const JS_ERROR_MESSAGES = {
  EMPTY_INPUT: "El código JavaScript está vacío",
} as const;

/**
 * Clean empty code constructs from JavaScript
 * Pure function - no side effects
 */
export function cleanJs(input: string, options: JsCleanOptions = {}): Result<string, string> {
  if (!input.trim()) {
    return {
      ok: false,
      error: JS_ERROR_MESSAGES.EMPTY_INPUT,
    };
  }

  const opts = {
    removeEmptyObject: options?.removeEmptyObject ?? true,
    removeEmptyArray: options?.removeEmptyArray ?? true,
    removeEmptyFunction: options?.removeEmptyFunction ?? true,
    removeEmptyString: options?.removeEmptyString ?? true,
  };

  try {
    let result = input;

    // Remove empty strings: "" or '' (not inside comments or strings)
    if (opts.removeEmptyString) {
      // Match empty strings, but not inside template literals or content
      result = result.replace(/(?<!\\)(["'])(?!\1)[^\\]*?\1/g, (match) => {
        // Check if it's an empty string ""
        if (match === '""' || match === "''") {
          return "";
        }
        return match;
      });
      // Clean up adjacent operators: ; ; or , , etc.
      result = result.replace(/;(\s*);/g, ";");
      result = result.replace(/,(\s*),/g, ",");
    }

    // Remove empty objects: {} or { }
    if (opts.removeEmptyObject) {
      // Match objects with only whitespace inside
      result = result.replace(/\{\s*\}/g, "");
      // Clean up adjacent operators
      result = result.replace(/;(\s*);/g, ";");
      result = result.replace(/,(\s*),/g, ",");
    }

    // Remove empty arrays: [] or [ ]
    if (opts.removeEmptyArray) {
      // Match arrays with only whitespace inside
      result = result.replace(/\[\s*\]/g, "");
      // Clean up adjacent operators
      result = result.replace(/;(\s*);/g, ";");
      result = result.replace(/,(\s*),/g, ",");
    }

    // Remove empty functions: function name() {} or () => {}
    if (opts.removeEmptyFunction) {
      // Match: function name() {} or function() {}
      result = result.replace(/function\s*\w*\s*\(\s*\)\s*\{\s*\}/g, "");
      // Match: () => {} or () => { }
      result = result.replace(/\(\s*\)\s*=>\s*\{\s*\}/g, "");
      // Match: async function name() {}
      result = result.replace(/async\s+function\s*\w*\s*\(\s*\)\s*\{\s*\}/g, "");
      // Match: async () => {}
      result = result.replace(/async\s*\(\s*\)\s*=>\s*\{\s*\}/g, "");
      // Clean up adjacent operators
      result = result.replace(/;(\s*);/g, ";");
      result = result.replace(/,(\s*),/g, ",");
    }

    // Final cleanup: remove multiple semicolons and clean up whitespace
    result = result.replace(/;{2,}/g, ";");
    result = result.replace(/,\s*,/g, ",");
    result = result.replace(/\n{3,}/g, "\n\n");
    result = result.trim();

    return { ok: true, value: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: `Error al limpiar código: ${message}` };
  }
}
