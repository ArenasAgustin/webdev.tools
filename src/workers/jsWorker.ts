import { formatJs } from "@/services/format/formatter";
import { minifyJs } from "@/services/js/minify";
import type { Result } from "@/types/common";
import type { JsWorkerRequest, JsWorkerResponse } from "@/services/js/worker.types";

const ctx = self as unknown as {
  postMessage: (message: JsWorkerResponse) => void;
  onmessage: (event: MessageEvent<JsWorkerRequest>) => void;
};

const toResponse = (id: string, result: Result<string, string>): JsWorkerResponse => {
  if (result.ok) {
    return { id, ok: true, value: result.value };
  }

  return { id, ok: false, error: { message: result.error } };
};

ctx.onmessage = (event: MessageEvent<JsWorkerRequest>) => {
  const request = event.data;
  const { id, input } = request;

  void (async () => {
    try {
      switch (request.action) {
        case "format":
          ctx.postMessage(toResponse(id, await formatJs(input, request.options?.indentSize ?? 2)));
          return;
        case "minify":
          ctx.postMessage(toResponse(id, minifyJs(input, request.options)));
          return;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      ctx.postMessage({ id, ok: false, error: { message } });
    }
  })();
};

export {};
