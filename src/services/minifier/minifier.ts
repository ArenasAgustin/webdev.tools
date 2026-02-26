import { type Result, type JsonValue, type JsonError } from "@/types/common";
import type { TransformService } from "@/services/transform";
import type { MinifyConfig } from "@/types/json";
import { sortJsonKeys, JSON_ERROR_MESSAGES } from "@/services/json/utils";
import { minify_sync as terserMinifySync } from "terser";

export type MinifyOptions = Partial<Pick<MinifyConfig, "removeSpaces" | "sortKeys">>;

export interface JsMinifyOptions {
  removeComments?: boolean;
  removeSpaces?: boolean;
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

export function minifyJson(input: string, options: MinifyOptions = {}): Result<string, JsonError> {
  if (!input.trim()) {
    return {
      ok: false,
      error: {
        message: JSON_ERROR_MESSAGES.EMPTY_INPUT,
      },
    };
  }

  try {
    const parsed = JSON.parse(input) as JsonValue;
    const processed = options.sortKeys ? sortJsonKeys(parsed) : parsed;
    const minified =
      options.removeSpaces === false
        ? JSON.stringify(processed, null, 1)
        : JSON.stringify(processed);
    return { ok: true, value: minified };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      error: {
        message: errorMessage,
      },
    };
  }
}

export const minifyJsonTransform: TransformService<MinifyOptions, JsonError> = {
  transform: (input, options = {}) => minifyJson(input, options),
};

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

export const minifyJsTransform: TransformService<JsMinifyOptions, string> = {
  transform: (input, options = {}) => minifyJs(input, options),
};
