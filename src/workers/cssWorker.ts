import { formatCss, minifyCss, cleanCss } from "@/services/css/transform";
import type { Result } from "@/types/common";
import type { CssWorkerRequest, CssWorkerResponse } from "@/services/css/worker.types";

const ctx = self as unknown as {
  postMessage: (message: CssWorkerResponse) => void;
  onmessage: (event: MessageEvent<CssWorkerRequest>) => void;
};

const toResponse = (id: string, result: Result<string, string>): CssWorkerResponse => {
  if (result.ok) {
    return { id, ok: true, value: result.value };
  }

  return { id, ok: false, error: { message: result.error } };
};

ctx.onmessage = (event: MessageEvent<CssWorkerRequest>) => {
  const request = event.data;
  const { id, input } = request;

  void (async () => {
    try {
      switch (request.action) {
        case "format":
          ctx.postMessage(toResponse(id, await formatCss(input, request.options?.indentSize ?? 2)));
          return;
        case "minify":
          ctx.postMessage(toResponse(id, await minifyCss(input, request.options)));
          return;
        case "clean":
          ctx.postMessage(toResponse(id, cleanCss(input, request.options)));
          return;
        default: {
          const action = (request as { action?: unknown }).action;
          ctx.postMessage({ id, ok: false, error: { message: `Unsupported worker action: ${String(action)}` } });
          return;
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      ctx.postMessage({ id, ok: false, error: { message } });
    }
  })();
};

export {};
