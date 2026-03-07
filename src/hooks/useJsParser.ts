import { useEffect, useState } from "react";
import { minifyJs } from "@/services/js/transform";

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

    void Promise.resolve(
      minifyJs(source, {
        removeComments: false,
        removeSpaces: false,
      }),
    ).then((result) => {
      if (cancelled) {
        return;
      }

      if (result.ok) {
        setValidation({ isValid: true, error: null });
      } else {
        setValidation({
          isValid: false,
          error: {
            message: `Error de sintaxis: ${result.error || "Código inválido"}`,
          },
        });
      }
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
