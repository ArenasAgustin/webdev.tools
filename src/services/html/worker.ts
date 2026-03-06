import type { Result, JsonError } from "@/types/common";
import type { IndentStyle } from "@/types/format";
import { runHtmlWorker } from "@/services/html/workerClient";
import type { HtmlMinifyOptions, HtmlWorkerPayload } from "@/services/html/worker.types";
import { executeWorkerOperation } from "@/services/worker/runtime";

const runHtmlOperation = (
  payload: HtmlWorkerPayload,
  runSync: () => Result<string, string> | Promise<Result<string, string>>,
) =>
  executeWorkerOperation({
    input: payload.input,
    payload,
    runWorker: runHtmlWorker,
    runSync: async () => {
      const result = await runSync();
      if (result.ok) {
        return result;
      }

      return {
        ok: false,
        error: {
          message: result.error,
        },
      } satisfies Result<string, JsonError>;
    },
    toError: (message): JsonError => ({ message }),
  });

export const formatHtmlAsync = async (
  input: string,
  options: { indentSize?: IndentStyle; formatCss?: boolean; formatJs?: boolean } = {},
): Promise<Result<string, JsonError>> => {
  return runHtmlOperation(
    {
      action: "format",
      input,
      options,
    },
    async () => {
      const { formatHtml } = await import("@/services/html/transform");
      return formatHtml(input, options.indentSize ?? 2, {
        formatCss: options.formatCss,
        formatJs: options.formatJs,
      });
    },
  );
};

export const minifyHtmlAsync = async (
  input: string,
  options: HtmlMinifyOptions,
): Promise<Result<string, JsonError>> => {
  return runHtmlOperation({ action: "minify", input, options }, async () => {
    const { minifyHtml } = await import("@/services/html/transform");
    return minifyHtml(input, options);
  });
};
