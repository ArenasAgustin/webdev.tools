import { useState, useCallback } from "react";
import { formatJson } from "@/services/json/format";
import { minifyJson } from "@/services/json/minify";
import { cleanJson } from "@/services/json/clean";
import type { FormatConfig, MinifyConfig, CleanConfig } from "@/types/json";

interface FormatterResult {
  output: string;
  error: string | null;
}

interface FormatterHook {
  output: string;
  error: string | null;
  format: (input: string, options?: Partial<FormatConfig>) => void;
  minify: (input: string, options?: Partial<MinifyConfig>) => void;
  clean: (input: string, options?: Partial<CleanConfig>) => void;
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

  const format = useCallback(
    (input: string, options?: Partial<FormatConfig>) => {
      if (!input.trim()) {
        setResult({ output: "", error: "No hay JSON para formatear" });
        return;
      }

      const formatResult = formatJson(input, {
        indent: options?.indent,
        sortKeys: options?.sortKeys,
      });
      if (formatResult.ok) {
        setResult({ output: formatResult.value, error: null });
        if (options?.autoCopy) {
          navigator.clipboard
            .writeText(formatResult.value)
            .catch(() => undefined);
        }
      } else {
        setResult({ output: "", error: formatResult.error.message });
      }
    },
    [],
  );

  const minify = useCallback(
    (input: string, options?: Partial<MinifyConfig>) => {
      if (!input.trim()) {
        setResult({ output: "", error: "No hay JSON para minificar" });
        return;
      }

      const minifyResult = minifyJson(input, {
        removeSpaces: options?.removeSpaces,
        sortKeys: options?.sortKeys,
      });
      if (minifyResult.ok) {
        setResult({ output: minifyResult.value, error: null });
        if (options?.autoCopy) {
          navigator.clipboard
            .writeText(minifyResult.value)
            .catch(() => undefined);
        }
      } else {
        setResult({ output: "", error: minifyResult.error.message });
      }
    },
    [],
  );

  const clean = useCallback((input: string, options?: Partial<CleanConfig>) => {
    if (!input.trim()) {
      setResult({ output: "", error: "No hay JSON para limpiar" });
      return;
    }

    const cleanResult = cleanJson(input, {
      removeNull: options?.removeNull,
      removeUndefined: options?.removeUndefined,
      removeEmptyString: options?.removeEmptyString,
      removeEmptyArray: options?.removeEmptyArray,
      removeEmptyObject: options?.removeEmptyObject,
      outputFormat: options?.outputFormat,
    });
    if (cleanResult.ok) {
      if (!cleanResult.value.trim()) {
        setResult({ output: "", error: "El JSON estaba completamente vacío" });
      } else {
        setResult({ output: cleanResult.value, error: null });
        if (options?.autoCopy) {
          navigator.clipboard
            .writeText(cleanResult.value)
            .catch(() => undefined);
        }
      }
    } else {
      setResult({ output: "", error: cleanResult.error.message });
    }
  }, []);

  const clearOutput = () => {
    setResult({ output: "", error: null });
  };

  return {
    output: result.output,
    error: result.error,
    format,
    minify,
    clean,
    clearOutput,
  };
}
