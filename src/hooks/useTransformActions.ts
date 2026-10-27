import { useCallback, useRef, useState } from "react";
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
  const [isProcessing, setIsProcessing] = useState(false);
  // Synchronous mirror of `isProcessing`: state only updates on the next render, so a
  // double click or a keyboard shortcut fired before it would otherwise start a second run.
  const busyRef = useRef(false);

  /** Marks a run as started. Returns false (and changes nothing) if one is already running. */
  const beginProcessing = useCallback(() => {
    if (busyRef.current) return false;
    busyRef.current = true;
    setIsProcessing(true);
    return true;
  }, []);

  const endProcessing = useCallback(() => {
    busyRef.current = false;
    setIsProcessing(false);
  }, []);

  const runTransformAction = useCallback(
    <TResult>({
      run,
      onSuccess,
      onError,
      successMessage,
      errorMessage,
    }: TransformActionOptions<TResult>) => {
      // Ignore re-entrant calls: overlapping runs could finish out of order.
      if (!beginProcessing()) return;
      createValidatedHandler({
        validate: createInputValidator,
        run,
        onSuccess: (result) => {
          endProcessing();
          void onSuccess?.(result);
        },
        onError: (message) => {
          endProcessing();
          void onError?.(message);
        },
        toast,
        successMessage,
        errorMessage,
      })();
    },
    [createInputValidator, toast, beginProcessing, endProcessing],
  );

  return {
    runTransformAction,
    isProcessing,
    beginProcessing,
    endProcessing,
  };
}
