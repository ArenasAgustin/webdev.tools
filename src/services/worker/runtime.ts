import type { Result } from "@/types/common";
import { WORKER_THRESHOLD_BYTES } from "@/utils/constants/limits";

interface WorkerResponseLike {
  ok: boolean;
  value?: string;
  error?: { message?: string };
}

interface ExecuteWorkerOperationOptions<TPayload, TError, TResponse extends WorkerResponseLike> {
  input: string;
  payload: TPayload;
  runWorker: (payload: TPayload) => Promise<TResponse>;
  runSync: () => Result<string, TError> | Promise<Result<string, TError>>;
  toError: (message: string) => TError;
  workerErrorMessage?: string;
  thresholdBytes?: number;
}

const getInputBytes = (input: string) => new TextEncoder().encode(input).length;

export const shouldUseWorkerForInput = (input: string, thresholdBytes = WORKER_THRESHOLD_BYTES) =>
  getInputBytes(input) >= thresholdBytes;

export const executeWorkerOperation = async <
  TPayload,
  TError,
  TResponse extends WorkerResponseLike,
>(
  options: ExecuteWorkerOperationOptions<TPayload, TError, TResponse>,
): Promise<Result<string, TError>> => {
  const {
    input,
    payload,
    runWorker,
    runSync,
    toError,
    workerErrorMessage = "Error en worker",
    thresholdBytes = WORKER_THRESHOLD_BYTES,
  } = options;

  if (!shouldUseWorkerForInput(input, thresholdBytes)) {
    return runSync();
  }

  try {
    const response = await runWorker(payload);

    if (response.ok) {
      return { ok: true, value: response.value ?? "" };
    }

    return { ok: false, error: toError(response.error?.message ?? workerErrorMessage) };
  } catch {
    return runSync();
  }
};
