import { useEffect, useState } from "react";
import { formatCss } from "@/services/css/transform";

interface CssValidation {
  isValid: boolean;
  error: {
    message: string;
  } | null;
}

export function useCssParser(input: string): CssValidation {
  const source = input.trim();
  const [validation, setValidation] = useState<CssValidation>({
    isValid: false,
    error: null,
  });

  useEffect(() => {
    if (!source) {
      return;
    }

    let cancelled = false;

    void formatCss(source)
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
            message: `Error de sintaxis: ${compactCssError(result.error || "CSS inválido")}`,
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
            message: `Error de sintaxis: ${compactCssError(message || "CSS inválido")}`,
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

function compactCssError(message: string): string {
  const firstLine = message
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  const compact = (firstLine ?? message).replace(/\s{2,}/g, " ").trim();
  return compact.length > 140 ? `${compact.slice(0, 137)}...` : compact;
}
