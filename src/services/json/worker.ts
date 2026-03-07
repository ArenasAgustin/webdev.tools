import type { Result, JsonError } from "@/types/common";
import type { JsonFormatOptions, JsonMinifyOptions } from "@/services/json/transform";
import { cleanJson, formatJson, minifyJson, type CleanOptions } from "@/services/json/transform";
import { applyJsonPath } from "@/services/json/jsonPath";
import { runJsonWorker } from "@/services/json/workerClient";
import type { JsonWorkerPayload } from "@/services/json/worker.types";
import { executeWorkerOperation } from "@/services/worker/runtime";

const runJsonTransformOp = (
  payload: JsonWorkerPayload,
  runSync: () => Result<string, string> | Promise<Result<string, string>>,
) =>
  executeWorkerOperation({
    input: payload.input,
    payload,
    runWorker: runJsonWorker,
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
  options: JsonFormatOptions = {},
): Promise<Result<string, JsonError>> => {
  return runJsonTransformOp({ action: "format", input, options }, () =>
    formatJson(input, options),
  );
};

export const minifyJsonAsync = async (
  input: string,
  options: JsonMinifyOptions = {},
): Promise<Result<string, JsonError>> => {
  return runJsonTransformOp({ action: "minify", input, options }, () =>
    minifyJson(input, options),
  );
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
