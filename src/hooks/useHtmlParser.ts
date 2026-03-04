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
            message: `Error de sintaxis: ${compactHtmlError(result.error || "HTML inválido")}`,
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
            message: `Error de sintaxis: ${compactHtmlError(message || "HTML inválido")}`,
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

function compactHtmlError(message: string): string {
  const firstLine = message
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  const compact = (firstLine ?? message).replace(/\s{2,}/g, " ").trim();
  return compact.length > 140 ? `${compact.slice(0, 137)}...` : compact;
}
