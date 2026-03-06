import { useEffect, useRef } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useTextStats } from "@/hooks/useTextStats";
import { MAX_INPUT_BYTES, MAX_INPUT_LABEL } from "@/utils/constants/limits";

interface UsePlaygroundInputLifecycleProps {
  input: string;
  saveInput: (value: string) => void;
  toast?: {
    info: (message: string) => void;
  };
  debounceMs?: number;
  maxInputBytes?: number;
  maxInputLabel?: string;
  inputWarningMessage?: string;
  inputTooLargeToastMessage?: string;
}

interface PlaygroundInputLifecycleState {
  debouncedInput: string;
  inputTooLarge: boolean;
  inputWarning: string | null;
}

export function usePlaygroundInputLifecycle({
  input,
  saveInput,
  toast,
  debounceMs = 300,
  maxInputBytes = MAX_INPUT_BYTES,
  maxInputLabel = MAX_INPUT_LABEL,
  inputWarningMessage = "Entrada grande: algunas operaciones pueden ser lentas",
  inputTooLargeToastMessage,
}: UsePlaygroundInputLifecycleProps): PlaygroundInputLifecycleState {
  const debouncedInput = useDebouncedValue(input, debounceMs);
  const inputStats = useTextStats(input);
  const inputTooLarge = inputStats.bytes > maxInputBytes;
  const inputWarning = inputTooLarge ? inputWarningMessage : null;
  const sizeWarningShown = useRef(false);

  useEffect(() => {
    saveInput(debouncedInput);
  }, [debouncedInput, saveInput]);

  useEffect(() => {
    if (inputTooLarge && !sizeWarningShown.current) {
      toast?.info(
        inputTooLargeToastMessage ??
          `El contenido supera ${maxInputLabel}. Algunas operaciones pueden ser lentas.`,
      );
      sizeWarningShown.current = true;
    }

    if (!inputTooLarge) {
      sizeWarningShown.current = false;
    }
  }, [inputTooLarge, toast, inputTooLargeToastMessage, maxInputLabel]);

  return {
    debouncedInput,
    inputTooLarge,
    inputWarning,
  };
}
