import type { Result, JsonError } from "@/types/common";
import type { IndentStyle } from "@/types/format";
import { cssWorkerAdapter } from "@/services/css/workerClient";
import type { CssMinifyOptions, CssWorkerPayload } from "@/services/css/worker.types";
import { executeWorkerOperation } from "@/services/worker/runtime";

const runCssOperation = (
  payload: CssWorkerPayload,
  runSync: () => Result<string, string> | Promise<Result<string, string>>,
) =>
  executeWorkerOperation({
    input: payload.input,
    payload,
    runWorker: cssWorkerAdapter.run,
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

export const formatCssAsync = async (
  input: string,
  indentSize: IndentStyle = 2,
): Promise<Result<string, JsonError>> => {
  return runCssOperation(
    {
      action: "format",
      input,
      options: { indentSize },
    },
    async () => {
      const { formatCss } = await import("@/services/css/transform");
      return formatCss(input, indentSize);
    },
  );
};

export const minifyCssAsync = async (
  input: string,
  options: CssMinifyOptions = {},
): Promise<Result<string, JsonError>> => {
  return runCssOperation({ action: "minify", input, options }, async () => {
    const { minifyCss } = await import("@/services/css/transform");
    return minifyCss(input, options);
  });
};
