import { useState, useCallback } from "react";
import { applyJsonPath } from "@/services/json/jsonPath";

interface JsonPathResult {
  output: string;
  error: string | null;
}

interface JsonPathHook {
  expression: string;
  output: string;
  error: string | null;
  setExpression: (expr: string) => void;
  filter: (input: string) => void;
  clearOutput: () => void;
}

/**
 * Hook to handle JSONPath filtering operations
 * Manages JSONPath expression, output, and error states
 */
export function useJsonPath(): JsonPathHook {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<JsonPathResult>({
    output: "",
    error: null,
  });

  const filter = useCallback(
    (input: string) => {
      if (!input.trim()) {
        setResult({ output: "", error: "No hay JSON para filtrar" });
        return;
      }

      if (!expression.trim()) {
        setResult({ output: "", error: "Ingresa una expresión JSONPath" });
        return;
      }

      const filterResult = applyJsonPath(input, expression);
      if (filterResult.ok) {
        const value = filterResult.value;
        // Check if result is empty
        if (!value.trim() || value === "[]" || value === "{}") {
          setResult({
            output: value,
            error: "El filtro no devolvió resultados",
          });
        } else {
          setResult({ output: value, error: null });
        }
      } else {
        setResult({ output: "", error: filterResult.error.message });
      }
    },
    [expression]
  );

  const clearOutput = useCallback(() => {
    setResult({ output: "", error: null });
  }, []);

  return {
    expression,
    output: result.output,
    error: result.error,
    setExpression,
    filter,
    clearOutput,
  };
}
