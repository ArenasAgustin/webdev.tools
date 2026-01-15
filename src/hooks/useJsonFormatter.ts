import { useState, useCallback } from "react";
import { formatJson } from "@/services/json/format";
import { minifyJson } from "@/services/json/minify";

interface FormatterResult {
  output: string;
  error: string | null;
}

interface FormatterHook {
  output: string;
  error: string | null;
  format: (input: string) => void;
  minify: (input: string) => void;
  clean: (input: string) => void;
  clearOutput: () => void;
}

/**
 * Hook to handle JSON formatting operations
 * Manages output state and error messages
 */
export function useJsonFormatter(): FormatterHook {
  const [result, setResult] = useState<FormatterResult>({
    output: "",
    error: null,
  });

  const format = useCallback((input: string) => {
    if (!input.trim()) {
      setResult({ output: "", error: "No hay JSON para formatear" });
      return;
    }

    const formatResult = formatJson(input);
    if (formatResult.ok) {
      setResult({ output: formatResult.value, error: null });
    } else {
      setResult({ output: "", error: formatResult.error.message });
    }
  }, []);

  const minify = useCallback((input: string) => {
    if (!input.trim()) {
      setResult({ output: "", error: "No hay JSON para minificar" });
      return;
    }

    const minifyResult = minifyJson(input);
    if (minifyResult.ok) {
      setResult({ output: minifyResult.value, error: null });
    } else {
      setResult({ output: "", error: minifyResult.error.message });
    }
  }, []);

  const clean = useCallback((input: string) => {
    // TODO: Implement clean empty values in future phase
    console.log("Limpiar vacíos - próximamente", input);
    setResult({ output: "", error: null });
  }, []);

  const clearOutput = useCallback(() => {
    setResult({ output: "", error: null });
  }, []);

  return {
    output: result.output,
    error: result.error,
    format,
    minify,
    clean,
    clearOutput,
  };
}
