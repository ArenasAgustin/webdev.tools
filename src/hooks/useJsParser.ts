import { useEffect, useState } from "react";
import { minifyJsAsync } from "@/services/js/worker";

interface JsValidation {
  isValid: boolean;
  error: {
    message: string;
  } | null;
}

export function useJsParser(input: string): JsValidation {
  const source = input.trim();
  const [validation, setValidation] = useState<JsValidation>({
    isValid: false,
    error: null,
  });

  useEffect(() => {
    if (!source) {
      return;
    }

    let cancelled = false;

    void minifyJsAsync(source, {
      removeComments: false,
      removeSpaces: false,
    })
      .then((result) => {
        if (cancelled) {
          return;
        }

        if (result.ok) {
          setValidation({ isValid: true, error: null });
          return;
        }

        setValidation({
          isValid: false,
          error: {
            message: `Error de sintaxis: ${result.error.message ?? "Código inválido"}`,
          },
        });
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        const message = error instanceof Error ? error.message : String(error);
        setValidation({
          isValid: false,
          error: {
            message: `Error de sintaxis: ${message || "Código inválido"}`,
          },
        });
      });

    return () => {
      cancelled = true;
    };
  }, [source]);

  if (!source) {
    return { isValid: false, error: null };
  }

  return validation;
}
