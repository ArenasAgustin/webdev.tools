import type { Result } from "@/types/common";
import { formatJs } from "@/services/formatter/formatter";
import { minifyJs, type JsMinifyOptions } from "@/services/minifier/minifier";
import { runJsWorker } from "@/services/js/workerClient";
import type { JsWorkerPayload } from "@/services/js/worker.types";
import { executeWorkerOperation } from "@/services/worker/runtime";
import type { IndentStyle } from "@/types/format";

const runJsOperation = (
  payload: JsWorkerPayload,
  runSync: () => Result<string, string> | Promise<Result<string, string>>,
) =>
  executeWorkerOperation({
    input: payload.input,
    payload,
    runWorker: runJsWorker,
    runSync,
    toError: (message) => message,
  });

export const formatJsAsync = async (
  input: string,
  indentSize: IndentStyle = 2,
): Promise<Result<string, string>> => {
  return runJsOperation(
    {
      action: "format",
      input,
      options: { indentSize },
    },
    () => formatJs(input, indentSize),
  );
};

export const minifyJsAsync = async (
  input: string,
  options: JsMinifyOptions = {},
): Promise<Result<string, string>> => {
  return runJsOperation({ action: "minify", input, options }, () => minifyJs(input, options));
};
