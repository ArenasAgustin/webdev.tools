import { formatJson, type FormatOptions } from "@/services/json/format";
import { minifyJson, type MinifyOptions } from "@/services/json/minify";
import { cleanJson, type CleanOptions } from "@/services/json/clean";
import { applyJsonPath } from "@/services/json/jsonPath";
import type { Result, JsonError } from "@/types/common";

type JsonWorkerAction = "format" | "minify" | "clean" | "jsonPath";

interface JsonWorkerRequest {
  id: string;
  action: JsonWorkerAction;
  input: string;
  options?: FormatOptions | MinifyOptions | CleanOptions;
  path?: string;
}

interface JsonWorkerResponse {
  id: string;
  ok: boolean;
  value?: string;
  error?: JsonError;
}

const ctx = self as unknown as {
  postMessage: (message: JsonWorkerResponse) => void;
  onmessage: (event: MessageEvent<JsonWorkerRequest>) => void;
};

const toResponse = (id: string, result: Result<string, JsonError>): JsonWorkerResponse => {
  if (result.ok) {
    return { id, ok: true, value: result.value };
  }

  return { id, ok: false, error: result.error };
};

ctx.onmessage = (event: MessageEvent<JsonWorkerRequest>) => {
  const { id, action, input, options, path } = event.data;

  try {
    if (action === "format") {
      ctx.postMessage(toResponse(id, formatJson(input, options as FormatOptions)));
      return;
    }

    if (action === "minify") {
      ctx.postMessage(toResponse(id, minifyJson(input, options as MinifyOptions)));
      return;
    }

    if (action === "clean") {
      ctx.postMessage(toResponse(id, cleanJson(input, options as CleanOptions)));
      return;
    }

    if (action === "jsonPath") {
      ctx.postMessage(toResponse(id, applyJsonPath(input, path ?? "")));
      return;
    }

    ctx.postMessage({
      id,
      ok: false,
      error: { message: "Accion no soportada" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    ctx.postMessage({ id, ok: false, error: { message } });
  }
};

export {};
