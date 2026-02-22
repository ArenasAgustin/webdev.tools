import { useCallback } from "react";
import { jsPlaygroundConfig } from "@/playgrounds/js/js.config";
import { formatJsAsync, minifyJsAsync } from "@/services/js/worker";
import { createValidatedHandler } from "@/utils/handlerFactory";
import { usePlaygroundActions, type ToastApi } from "./usePlaygroundActions";
import type { JsFormatConfig, JsMinifyConfig } from "@/types/js";

/**
 * Props for JS playground actions hook
 */
interface UseJsPlaygroundActionsProps {
  inputCode: string;
  setInputCode: (value: string) => void;
  output: string;
  setOutput: (value: string) => void;
  setError: (error: string | null) => void;
  inputTooLarge?: boolean;
  inputTooLargeMessage?: string;
  formatConfig: JsFormatConfig;
  minifyConfig: JsMinifyConfig;
  toast?: ToastApi;
}

/**
 * Hook for JavaScript playground actions
 * Provides all handlers for JS code manipulation (execute, format, minify, clear, etc.)
 */
export function useJsPlaygroundActions({
  inputCode,
  setInputCode,
  output,
  setOutput,
  setError,
  inputTooLarge,
  inputTooLargeMessage,
  formatConfig,
  minifyConfig,
  toast,
}: UseJsPlaygroundActionsProps) {
  // Get base playground actions
  const baseActions = usePlaygroundActions({
    input: inputCode,
    setInput: setInputCode,
    exampleContent: jsPlaygroundConfig.example,
    toast,
    onClearOutputs: useCallback(() => {
      setOutput("");
      setError(null);
    }, [setOutput, setError]),
    validateInput: useCallback(
      () =>
        inputTooLarge
          ? (inputTooLargeMessage ?? "El contenido es demasiado grande para procesarlo.")
          : null,
      [inputTooLarge, inputTooLargeMessage],
    ),
  });

  /**
   * Execute JavaScript code
   */
  const handleExecute = useCallback(() => {
    createValidatedHandler({
      validate: baseActions.createInputValidator,
      run: () => {
        setError(null);
        setOutput("");

        const logs: string[] = [];
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        try {
          console.log = (...args: unknown[]) => {
            logs.push(args.map((arg) => formatValue(arg)).join(" "));
            originalLog(...args);
          };

          console.error = (...args: unknown[]) => {
            logs.push(`ERROR: ${args.map((arg) => formatValue(arg)).join(" ")}`);
            originalError(...args);
          };

          console.warn = (...args: unknown[]) => {
            logs.push(`WARN: ${args.map((arg) => formatValue(arg)).join(" ")}`);
            originalWarn(...args);
          };

          const executeUserCode = new Function(inputCode) as () => unknown;
          const result = executeUserCode();

          const outputText = logs.length > 0 ? logs.join("\n") : "";
          if (result !== undefined && result !== null && logs.length === 0) {
            setOutput(formatValue(result));
          } else {
            setOutput(outputText);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          throw new Error(`Error: ${message}`);
        } finally {
          console.log = originalLog;
          console.error = originalError;
          console.warn = originalWarn;
        }
      },
      toast,
      successMessage: "Código ejecutado correctamente",
      onError: (message) => {
        setError(message.replace(/^Error:\s*/, ""));
      },
    })();
  }, [baseActions, inputCode, setOutput, setError, toast]);

  /**
   * Copy input code to clipboard
   */
  const handleCopyInput = useCallback(() => {
    baseActions.handleCopy({
      text: inputCode,
      successMessage: "Código copiado al portapapeles",
      validate: () => (!inputCode ? "No hay código para copiar" : null),
    });
  }, [baseActions, inputCode]);

  /**
   * Copy output to clipboard
   */
  const handleCopyOutput = useCallback(() => {
    baseActions.handleCopy({
      text: output,
      successMessage: "Resultado copiado al portapapeles",
      validate: () => (!output ? "No hay resultado para copiar" : null),
    });
  }, [baseActions, output]);

  /**
   * Download input code as file
   */
  const handleDownloadInput = useCallback(() => {
    baseActions.handleDownload({
      content: inputCode,
      fileName: "code.js",
      mimeType: "application/javascript",
      successMessage: "Descargado como code.js",
      validate: () => (!inputCode ? "No hay código para descargar" : null),
    });
  }, [baseActions, inputCode]);

  /**
   * Download output as file
   */
  const handleDownloadOutput = useCallback(() => {
    baseActions.handleDownload({
      content: output,
      fileName: "output.txt",
      mimeType: "text/plain",
      successMessage: "Descargado como output.txt",
      validate: () => (!output ? "No hay resultado para descargar" : null),
    });
  }, [baseActions, output]);

  /**
   * Format JavaScript code
   */
  const handleFormat = useCallback(() => {
    createValidatedHandler({
      validate: baseActions.createInputValidator,
      run: async () => {
        const result = await formatJsAsync(inputCode, formatConfig.indentSize);

        if (!result.ok) {
          throw new Error(result.error ?? "Error al formatear código");
        }

        return result.value;
      },
      onSuccess: (value) => {
        setInputCode(value);
        setError(null);
        setOutput("");
        if (formatConfig.autoCopy && value) {
          navigator.clipboard.writeText(value).catch((err) => {
            console.error("Error al copiar al portapapeles: ", err);
          });
        }
      },
      onError: (message) => {
        setError(message);
      },
      toast,
      successMessage: "Código formateado correctamente",
      errorMessage: "Error al formatear código",
    })();
  }, [baseActions, inputCode, formatConfig, setInputCode, setError, setOutput, toast]);

  /**
   * Minify JavaScript code
   */
  const handleMinify = useCallback(() => {
    createValidatedHandler({
      validate: baseActions.createInputValidator,
      run: async () => {
        const result = await minifyJsAsync(inputCode, {
          removeComments: minifyConfig.removeComments,
          removeSpaces: minifyConfig.removeSpaces,
        });

        if (!result.ok) {
          throw new Error(result.error ?? "Error al minificar código");
        }

        return result.value;
      },
      onSuccess: (value) => {
        setInputCode(value);
        setError(null);
        setOutput("");
        if (minifyConfig.autoCopy && value) {
          navigator.clipboard.writeText(value).catch((err) => {
            console.error("Error al copiar al portapapeles: ", err);
          });
        }
      },
      onError: (message) => {
        setError(message);
      },
      toast,
      successMessage: "Código minificado correctamente",
      errorMessage: "Error al minificar código",
    })();
  }, [baseActions, inputCode, minifyConfig, setInputCode, setError, setOutput, toast]);

  return {
    handleClearInput: baseActions.handleClearInput,
    handleLoadExample: baseActions.handleLoadExample,
    handleExecute,
    handleCopyInput,
    handleCopyOutput,
    handleDownloadInput,
    handleDownloadOutput,
    handleFormat,
    handleMinify,
  };
}

/**
 * Format values for display in console
 */
function formatValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return Object.prototype.toString.call(value);
    }
  }
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return String(value);
  return Object.prototype.toString.call(value);
}
