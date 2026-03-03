import { useEffect, useState } from "react";
import { formatHtml } from "@/services/html/transform";

interface HtmlValidation {
  isValid: boolean;
  error: {
    message: string;
  } | null;
}

export function useHtmlParser(input: string): HtmlValidation {
  const source = input.trim();
  const [validation, setValidation] = useState<HtmlValidation>({
    isValid: false,
    error: null,
  });

  useEffect(() => {
    if (!source) {
      return;
    }

    let cancelled = false;

    void formatHtml(source)
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
            message: `Error de sintaxis: ${result.error || "HTML inválido"}`,
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
            message: `Error de sintaxis: ${message || "HTML inválido"}`,
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
