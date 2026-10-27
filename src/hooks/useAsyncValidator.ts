import { useEffect, useState } from "react";
import { compactTransformError } from "@/utils/transformError";
import { translate } from "@/i18n/translate";
import { localizeServiceMessage } from "@/services/localizeServiceMessage";

export interface ValidationState {
  isValid: boolean;
  error: { message: string } | null;
}

type ValidateFn = (source: string) => Promise<{ ok: boolean; error?: string }>;

const EMPTY: ValidationState = { isValid: false, error: null };

/**
 * Generic async validation hook for playground parsers.
 * Wraps a validate function with cancelled-flag pattern and error compacting.
 *
 * @param input - Raw input string (will be trimmed)
 * @param validateFn - Async function that returns `{ ok, error? }`
 * @param fallbackError - Fallback message when error is empty (e.g. "CSS inválido")
 */
export function useAsyncValidator(
  input: string,
  validateFn: ValidateFn,
  fallbackError: string,
): ValidationState {
  const source = input.trim();
  const [validation, setValidation] = useState<ValidationState>(EMPTY);

  useEffect(() => {
    if (!source) return;

    let cancelled = false;

    void validateFn(source)
      .then((result) => {
        if (cancelled) return;

        if (result.ok) {
          setValidation({ isValid: true, error: null });
        } else {
          setValidation({
            isValid: false,
            error: {
              message: translate("validation.syntaxError", {
                // Parsers call worker-safe transforms directly; localize their message keys.
                message: compactTransformError(localizeServiceMessage(result.error ?? fallbackError)),
              }),
            },
          });
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;

        const message = error instanceof Error ? error.message : String(error);
        setValidation({
          isValid: false,
          error: {
            message: translate("validation.syntaxError", {
              message: compactTransformError(message ?? fallbackError),
            }),
          },
        });
      });

    return () => {
      cancelled = true;
    };
  }, [source, validateFn, fallbackError]);

  return !source ? EMPTY : validation;
}
