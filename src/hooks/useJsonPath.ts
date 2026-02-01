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
  filter: (
    input: string,
    overrideExpression?: string,
  ) => {
    ok: boolean;
    error?: string;
  };
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
    (input: string, overrideExpression?: string) => {
      const expr = overrideExpression ?? expression;

      if (!input.trim()) {
        const error = "No hay JSON para filtrar";
        setResult({ output: "", error });
        return { ok: false, error };
      }

      if (!expr.trim()) {
        const error = "Ingresa una expresión JSONPath";
        setResult({ output: "", error });
        return { ok: false, error };
      }

      const filterResult = applyJsonPath(input, expr);
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
        return { ok: true };
      }

      setResult({ output: "", error: filterResult.error.message });
      return { ok: false, error: filterResult.error.message };
    },
    [expression],
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
