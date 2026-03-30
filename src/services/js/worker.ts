import type { Result } from "@/types/common";
import type { JsonError } from "@/types/common";
import { jsWorkerAdapter } from "@/services/js/workerClient";
import type { JsWorkerPayload } from "@/services/js/worker.types";
import { executeWorkerOperation } from "@/services/worker/runtime";
import type { IndentStyle } from "@/types/format";
import type { JsMinifyOptions, JsCleanOptions } from "@/services/js/transform";

const runJsOperation = (
  payload: JsWorkerPayload,
  runSync: () => Result<string, string> | Promise<Result<string, string>>,
) =>
  executeWorkerOperation({
    input: payload.input,
    payload,
    runWorker: jsWorkerAdapter.run,
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

export const formatJsAsync = async (
  input: string,
  indentSize: IndentStyle = 2,
): Promise<Result<string, JsonError>> => {
  return runJsOperation(
    {
      action: "format",
      input,
      options: { indentSize },
    },
    async () => {
      const { formatJs } = await import("@/services/js/transform");
      return formatJs(input, indentSize);
    },
  );
};

export const minifyJsAsync = async (
  input: string,
  options: JsMinifyOptions = {},
): Promise<Result<string, JsonError>> => {
  return runJsOperation({ action: "minify", input, options }, async () => {
    const { minifyJs } = await import("@/services/js/transform");
    return minifyJs(input, options);
  });
};

export const cleanJsAsync = async (
  input: string,
  options: JsCleanOptions = {},
): Promise<Result<string, JsonError>> => {
  return runJsOperation({ action: "clean", input, options }, async () => {
    const { cleanJs } = await import("@/services/js/transform");
    return cleanJs(input, options);
  });
};
