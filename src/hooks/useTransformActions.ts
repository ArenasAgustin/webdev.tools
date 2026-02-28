import { useCallback } from "react";
import { createValidatedHandler } from "@/utils/handlerFactory";
import type { ToastApi } from "./usePlaygroundActions";

interface TransformActionOptions<TResult> {
  run: () => TResult | Promise<TResult>;
  onSuccess?: (result: TResult) => void | Promise<void>;
  onError?: (message: string) => void | Promise<void>;
  successMessage: string;
  errorMessage: string;
}

interface UseTransformActionsProps {
  createInputValidator: () => string | null;
  toast?: ToastApi;
}

export function useTransformActions({ createInputValidator, toast }: UseTransformActionsProps) {
  const runTransformAction = useCallback(
    <TResult>({
      run,
      onSuccess,
      onError,
      successMessage,
      errorMessage,
    }: TransformActionOptions<TResult>) => {
      createValidatedHandler({
        validate: createInputValidator,
        run,
        onSuccess,
        onError,
        toast,
        successMessage,
        errorMessage,
      })();
    },
    [createInputValidator, toast],
  );

  return {
    runTransformAction,
  };
}
