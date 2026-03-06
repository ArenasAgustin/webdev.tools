import { formatHtml, minifyHtml } from "@/services/html/transform";
import type { Result } from "@/types/common";
import type { HtmlWorkerRequest, HtmlWorkerResponse } from "@/services/html/worker.types";

const ctx = self as unknown as {
  postMessage: (message: HtmlWorkerResponse) => void;
  onmessage: (event: MessageEvent<HtmlWorkerRequest>) => void;
};

const toResponse = (id: string, result: Result<string, string>): HtmlWorkerResponse => {
  if (result.ok) {
    return { id, ok: true, value: result.value };
  }

  return { id, ok: false, error: { message: result.error } };
};

ctx.onmessage = (event: MessageEvent<HtmlWorkerRequest>) => {
  const request = event.data;
  const { id, input } = request;

  void (async () => {
    try {
      switch (request.action) {
        case "format":
          ctx.postMessage(
            toResponse(
              id,
              await formatHtml(input, request.options?.indentSize ?? 2, {
                formatCss: request.options?.formatCss,
                formatJs: request.options?.formatJs,
              }),
            ),
          );
          return;
        case "minify":
          ctx.postMessage(
            toResponse(
              id,
              await minifyHtml(input, {
                removeComments: request.options?.removeComments ?? true,
                collapseWhitespace: request.options?.collapseWhitespace ?? true,
                minifyCss: request.options?.minifyCss ?? true,
                minifyJs: request.options?.minifyJs ?? true,
              }),
            ),
          );
          return;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      ctx.postMessage({ id, ok: false, error: { message } });
    }
  })();
};

export {};
