import { formatJson } from "@/services/format/formatter";
import { minifyJson } from "@/services/json/minify";
import { cleanJson } from "@/services/json/clean";
import { applyJsonPath } from "@/services/json/jsonPath";
import type { Result, JsonError } from "@/types/common";
import type { JsonWorkerRequest, JsonWorkerResponse } from "@/services/json/worker.types";

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
  const request = event.data;
  const { id, input } = request;

  void (async () => {
    try {
      switch (request.action) {
        case "format":
          ctx.postMessage(toResponse(id, await formatJson(input, request.options)));
          return;
        case "minify":
          ctx.postMessage(toResponse(id, minifyJson(input, request.options)));
          return;
        case "clean":
          ctx.postMessage(toResponse(id, cleanJson(input, request.options)));
          return;
        case "jsonPath":
          ctx.postMessage(toResponse(id, applyJsonPath(input, request.path)));
          return;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      ctx.postMessage({ id, ok: false, error: { message } });
    }
  })();
};

export {};
