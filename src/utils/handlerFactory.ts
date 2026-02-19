type MaybePromise<T> = T | Promise<T>;

interface ResultLike {
  ok: boolean;
  error?: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

export interface ValidatedHandlerOptions<TResult> {
  run: () => MaybePromise<TResult>;
  validate?: () => string | null;
  toast?: ToastApi;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (result: TResult) => MaybePromise<void>;
  onError?: (message: string) => MaybePromise<void>;
}

function isPromiseLike<T>(value: unknown): value is PromiseLike<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "then" in value &&
    typeof (value as { then?: unknown }).then === "function"
  );
}

function isResultLike(value: unknown): value is ResultLike {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return "ok" in value && typeof (value as { ok: unknown }).ok === "boolean";
}

function toErrorMessage(error: unknown, fallback = "Ha ocurrido un error"): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error) {
    return error;
  }

  return fallback;
}

export function createValidatedHandler<TResult>(
  options: ValidatedHandlerOptions<TResult>,
): () => void {
  const { run, validate, toast, successMessage, errorMessage, onSuccess, onError } = options;

  return () => {
    const fail = (message: string) => {
      toast?.error(message);
      const effect = onError?.(message);
      if (isPromiseLike<void>(effect)) {
        void effect;
      }
    };

    const finalizeSuccess = () => {
      if (successMessage) {
        toast?.success(successMessage);
      }
    };

    const succeed = (result: TResult) => {
      const effect = onSuccess?.(result);
      if (isPromiseLike<void>(effect)) {
        void effect
          .then(() => {
            finalizeSuccess();
          })
          .catch((error) => {
            fail(toErrorMessage(error, errorMessage));
          });
        return;
      }

      finalizeSuccess();
    };

    const process = (result: TResult) => {
      if (isResultLike(result) && !result.ok) {
        fail(result.error ?? errorMessage ?? "Ha ocurrido un error");
        return;
      }

      succeed(result);
    };

    const validationMessage = validate?.() ?? null;
    if (validationMessage) {
      fail(validationMessage);
      return;
    }

    try {
      const result = run();

      if (isPromiseLike<TResult>(result)) {
        void result
          .then((resolved) => {
            process(resolved);
          })
          .catch((error) => {
            fail(toErrorMessage(error, errorMessage));
          });
        return;
      }

      process(result);
    } catch (error) {
      fail(toErrorMessage(error, errorMessage));
    }
  };
}
