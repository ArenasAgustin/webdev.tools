import { useState, useCallback } from "react";
import {
  formatJsonAsync,
  minifyJsonAsync,
  cleanJsonAsync,
} from "@/services/json/worker";
import type { FormatConfig, MinifyConfig, CleanConfig } from "@/types/json";

interface FormatterResult {
  output: string;
  error: string | null;
}

interface FormatterHook {
  output: string;
  error: string | null;
  format: (
    input: string,
    options?: Partial<FormatConfig>,
  ) => Promise<{ ok: boolean; error?: string }>;
  minify: (
    input: string,
    options?: Partial<MinifyConfig>,
  ) => Promise<{ ok: boolean; error?: string }>;
  clean: (
    input: string,
    options?: Partial<CleanConfig>,
  ) => Promise<{ ok: boolean; error?: string }>;
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
    async (input: string, options?: Partial<FormatConfig>) => {
      if (!input.trim()) {
        const errorMsg = "No hay JSON para formatear";
        setResult({ output: "", error: errorMsg });
        return { ok: false, error: errorMsg };
      }

      const formatResult = await formatJsonAsync(input, {
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
        return { ok: true };
      } else {
        const errorMsg = formatResult.error.message;
        setResult({ output: "", error: errorMsg });
        return { ok: false, error: errorMsg };
      }
    },
    [],
  );

  const minify = useCallback(
    async (input: string, options?: Partial<MinifyConfig>) => {
      if (!input.trim()) {
        const errorMsg = "No hay JSON para minificar";
        setResult({ output: "", error: errorMsg });
        return { ok: false, error: errorMsg };
      }

      const minifyResult = await minifyJsonAsync(input, {
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
        return { ok: true };
      } else {
        const errorMsg = minifyResult.error.message;
        setResult({ output: "", error: errorMsg });
        return { ok: false, error: errorMsg };
      }
    },
    [],
  );

  const clean = useCallback(
    async (input: string, options?: Partial<CleanConfig>) => {
      if (!input.trim()) {
        const errorMsg = "No hay JSON para limpiar";
        setResult({ output: "", error: errorMsg });
        return { ok: false, error: errorMsg };
      }

      const cleanResult = await cleanJsonAsync(input, {
        removeNull: options?.removeNull,
        removeUndefined: options?.removeUndefined,
        removeEmptyString: options?.removeEmptyString,
        removeEmptyArray: options?.removeEmptyArray,
        removeEmptyObject: options?.removeEmptyObject,
        outputFormat: options?.outputFormat,
      });
      if (cleanResult.ok) {
        if (!cleanResult.value.trim()) {
          const errorMsg = "El JSON estaba completamente vacío";
          setResult({ output: "", error: errorMsg });
          return { ok: false, error: errorMsg };
        } else {
          setResult({ output: cleanResult.value, error: null });
          if (options?.autoCopy) {
            navigator.clipboard
              .writeText(cleanResult.value)
              .catch(() => undefined);
          }
          return { ok: true };
        }
      } else {
        const errorMsg = cleanResult.error.message;
        setResult({ output: "", error: errorMsg });
        return { ok: false, error: errorMsg };
      }
    },
    [],
  );

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
