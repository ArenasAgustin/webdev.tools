import type { Result, JsonError } from "@/types/common";
import { formatJson, type FormatOptions } from "@/services/formatter/formatter";
import { minifyJson, type MinifyOptions } from "@/services/minifier/minifier";
import { cleanJson, type CleanOptions } from "@/services/json/clean";
import { applyJsonPath } from "@/services/json/jsonPath";
import { runJsonWorker } from "@/services/json/workerClient";
import type { JsonWorkerPayload } from "@/services/json/worker.types";
import { executeWorkerOperation } from "@/services/worker/runtime";

const runJsonOperation = (
  payload: JsonWorkerPayload,
  runSync: () => Result<string, JsonError> | Promise<Result<string, JsonError>>,
) =>
  executeWorkerOperation({
    input: payload.input,
    payload,
    runWorker: runJsonWorker,
    runSync,
    toError: (message): JsonError => ({ message }),
  });

export const formatJsonAsync = async (
  input: string,
  options: FormatOptions = {},
): Promise<Result<string, JsonError>> => {
  return runJsonOperation({ action: "format", input, options }, () => formatJson(input, options));
};

export const minifyJsonAsync = async (
  input: string,
  options: MinifyOptions = {},
): Promise<Result<string, JsonError>> => {
  return runJsonOperation({ action: "minify", input, options }, () => minifyJson(input, options));
};

export const cleanJsonAsync = async (
  input: string,
  options: CleanOptions = {},
): Promise<Result<string, JsonError>> => {
  return runJsonOperation({ action: "clean", input, options }, () => cleanJson(input, options));
};

export const applyJsonPathAsync = async (
  input: string,
  path: string,
): Promise<Result<string, JsonError>> => {
  return runJsonOperation({ action: "jsonPath", input, path }, () => applyJsonPath(input, path));
};
