import { useMemo } from "react";
import { parseJson } from "@/services/json/parse";
import type { JsonError } from "@/types/common";

interface JsonValidation {
  isValid: boolean;
  error: JsonError | null;
}

/**
 * Hook to parse and validate JSON input
 * Returns validation state derived from input value
 */
export function useJsonParser(input: string): JsonValidation {
  return useMemo(() => {
    if (!input.trim()) {
      return { isValid: false, error: null };
    }

    const result = parseJson(input);
    if (result.ok) {
      return { isValid: true, error: null };
    } else {
      return { isValid: false, error: result.error };
    }
  }, [input]);
}
