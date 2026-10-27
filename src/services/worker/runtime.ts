import type { Result } from "@/types/common";
import { WORKER_THRESHOLD_BYTES } from "@/utils/constants/limits";
import { localizeServiceResult } from "@/services/localizeServiceMessage";
import { serviceMessage } from "@/services/serviceMessage";

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

/**
 * Runs an operation in its worker (or synchronously for small inputs) on the
 * main thread. Errors carrying `services.*` message keys are localized here, so
 * callers always receive user-facing text.
 */
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
    workerErrorMessage = serviceMessage("services.worker.error"),
    thresholdBytes = WORKER_THRESHOLD_BYTES,
  } = options;

  if (!shouldUseWorkerForInput(input, thresholdBytes)) {
    return localizeServiceResult(await runSync());
  }

  try {
    const response = await runWorker(payload);

    if (response.ok) {
      return { ok: true, value: response.value ?? "" };
    }

    return localizeServiceResult<string, TError>({
      ok: false,
      error: toError(response.error?.message ?? workerErrorMessage),
    });
  } catch {
    return localizeServiceResult(await runSync());
  }
};
