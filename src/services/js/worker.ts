import type { Result } from "@/types/common";
import { formatJs } from "@/services/js/format";
import { minifyJs, type JsMinifyOptions } from "@/services/js/minify";
import { runJsWorker } from "@/services/js/workerClient";
import type { JsWorkerPayload } from "@/services/js/worker.types";
import { WORKER_THRESHOLD_BYTES } from "@/utils/constants/limits";

const getInputBytes = (input: string) => new TextEncoder().encode(input).length;

const shouldUseWorker = (input: string) => getInputBytes(input) >= WORKER_THRESHOLD_BYTES;

const runWorkerSafely = async (
  payload: JsWorkerPayload,
): Promise<Result<string, string> | null> => {
  try {
    const response = await runJsWorker(payload);
    if (response.ok) {
      return { ok: true, value: response.value ?? "" };
    }

    return { ok: false, error: response.error?.message ?? "Error en worker" };
  } catch {
    return null;
  }
};

export const formatJsAsync = async (
  input: string,
  indentSize = 2,
): Promise<Result<string, string>> => {
  if (shouldUseWorker(input)) {
    const workerResult = await runWorkerSafely({
      action: "format",
      input,
      options: { indentSize },
    });
    if (workerResult) {
      return workerResult;
    }
  }

  return formatJs(input, indentSize);
};

export const minifyJsAsync = async (
  input: string,
  options: JsMinifyOptions = {},
): Promise<Result<string, string>> => {
  if (shouldUseWorker(input)) {
    const workerResult = await runWorkerSafely({ action: "minify", input, options });
    if (workerResult) {
      return workerResult;
    }
  }

  return minifyJs(input, options);
};
