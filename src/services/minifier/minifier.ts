import { type Result, type JsonValue, type JsonError } from "@/types/common";
import type { TransformService } from "@/services/transform";
import type { MinifyConfig } from "@/types/json";
import { sortJsonKeys, JSON_ERROR_MESSAGES } from "@/services/json/utils";

export type MinifyOptions = Partial<Pick<MinifyConfig, "removeSpaces" | "sortKeys">>;

export interface JsMinifyOptions {
  removeComments?: boolean;
  removeSpaces?: boolean;
}

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

    let result = input;

    if (removeComments) {
      result = result.replace(/\/\/.*?$/gm, "");
      result = result.replace(/\/\*[\s\S]*?\*\//g, "");
    }

    if (removeSpaces) {
      result = result
        .split("\n")
        .map((line) => line.trim())
        .join("");

      result = result.replace(/\s+/g, " ");
      result = result.replace(/\s*([{}[\]()=+\-*/<>!&|^~?:;,.])\s*/g, "$1");
      result = result.replace(
        /\b(if|else|for|while|do|switch|case|break|continue|return|function|const|let|var|new|delete|typeof|instanceof|in|of|async|await|yield|import|export|default|class|extends|static|super|this|that|true|false|null|undefined)\b/g,
        " $1 ",
      );

      result = result.replace(/\s+/g, " ");
      result = result.replace(/\s+;/g, ";");
      result = result.replace(/\s+,/g, ",");
      result = result.replace(/\(\s+/g, "(");
      result = result.replace(/\s+\)/g, ")");
    }

    return { ok: true, value: result.trim() };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message };
  }
}

export const minifyJsTransform: TransformService<JsMinifyOptions, string> = {
  transform: (input, options = {}) => minifyJs(input, options),
};
