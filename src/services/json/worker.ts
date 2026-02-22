import type { Result, JsonError } from "@/types/common";
import { formatJson, type FormatOptions } from "@/services/json/format";
import { minifyJson, type MinifyOptions } from "@/services/json/minify";
import { cleanJson, type CleanOptions } from "@/services/json/clean";
import { applyJsonPath } from "@/services/json/jsonPath";
import { runJsonWorker } from "@/services/json/workerClient";
import type { JsonWorkerPayload } from "@/services/json/worker.types";
import { WORKER_THRESHOLD_BYTES } from "@/utils/constants/limits";

const getInputBytes = (input: string) => new TextEncoder().encode(input).length;

const shouldUseWorker = (input: string) => getInputBytes(input) >= WORKER_THRESHOLD_BYTES;

const toFallbackError = (message: string): Result<string, JsonError> => ({
  ok: false,
  error: { message },
});

const runWorkerSafely = async (
  payload: JsonWorkerPayload,
): Promise<Result<string, JsonError> | null> => {
  try {
    const response = await runJsonWorker(payload);
    if (response.ok) {
      return { ok: true, value: response.value ?? "" };
    }

    return toFallbackError(response.error?.message ?? "Error en worker");
  } catch {
    return null;
  }
};

export const formatJsonAsync = async (
  input: string,
  options: FormatOptions = {},
): Promise<Result<string, JsonError>> => {
  if (shouldUseWorker(input)) {
    const workerResult = await runWorkerSafely({ action: "format", input, options });
    if (workerResult) {
      return workerResult;
    }
  }

  return formatJson(input, options);
};

export const minifyJsonAsync = async (
  input: string,
  options: MinifyOptions = {},
): Promise<Result<string, JsonError>> => {
  if (shouldUseWorker(input)) {
    const workerResult = await runWorkerSafely({ action: "minify", input, options });
    if (workerResult) {
      return workerResult;
    }
  }

  return minifyJson(input, options);
};

export const cleanJsonAsync = async (
  input: string,
  options: CleanOptions = {},
): Promise<Result<string, JsonError>> => {
  if (shouldUseWorker(input)) {
    const workerResult = await runWorkerSafely({ action: "clean", input, options });
    if (workerResult) {
      return workerResult;
    }
  }

  return cleanJson(input, options);
};

export const applyJsonPathAsync = async (
  input: string,
  path: string,
): Promise<Result<string, JsonError>> => {
  if (shouldUseWorker(input)) {
    const workerResult = await runWorkerSafely({ action: "jsonPath", input, path });
    if (workerResult) {
      return workerResult;
    }
  }

  return applyJsonPath(input, path);
};
