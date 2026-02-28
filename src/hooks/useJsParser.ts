import { useMemo } from "react";
import { minifyJs } from "@/services/minifier/minifier";

interface JsValidation {
  isValid: boolean;
  error: {
    message: string;
  } | null;
}

export function useJsParser(input: string): JsValidation {
  return useMemo(() => {
    if (!input.trim()) {
      return { isValid: false, error: null };
    }

    const parseResult = minifyJs(input, {
      removeComments: false,
      removeSpaces: false,
    });

    if (parseResult.ok) {
      return { isValid: true, error: null };
    }

    return {
      isValid: false,
      error: {
        message: `Error de sintaxis: ${parseResult.error}`,
      },
    };
  }, [input]);
}
