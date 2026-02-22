import type { Result } from "@/types/common";
import { formatJs } from "@/services/js/format";
import { minifyJs, type JsMinifyOptions } from "@/services/js/minify";
import { runJsWorker } from "@/services/js/workerClient";
import type { JsWorkerPayload } from "@/services/js/worker.types";
import { executeWorkerOperation } from "@/services/worker/runtime";

const runJsOperation = (payload: JsWorkerPayload, runSync: () => Result<string, string>) =>
  executeWorkerOperation({
    input: payload.input,
    payload,
    runWorker: runJsWorker,
    runSync,
    toError: (message) => message,
  });

export const formatJsAsync = async (
  input: string,
  indentSize = 2,
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
