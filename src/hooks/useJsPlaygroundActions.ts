import { useCallback } from "react";
import { jsPlaygroundConfig } from "@/playgrounds/js/js.config";
import { jsService } from "@/services/js/service";
import { createValidatedHandler } from "@/utils/handlerFactory";
import { compactTransformError } from "@/utils/transformError";
import { usePlaygroundActions, type ToastApi } from "./usePlaygroundActions";
import { useTransformActions } from "./useTransformActions";
import type { JsFormatConfig, JsMinifyConfig } from "@/types/js";

const JS_EXEC_TIMEOUT_MS = 5000;

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

  const { runTransformAction } = useTransformActions({
    createInputValidator: baseActions.createInputValidator,
    toast,
  });

  /**
   * Execute JavaScript code
   */
  const handleExecute = useCallback(() => {
    createValidatedHandler({
      validate: baseActions.createInputValidator,
      run: async () => {
        setError(null);
        setOutput("");

        if (hasLikelyInfiniteLoop(inputCode)) {
          throw new Error("La ejecución superó 5 segundos y fue cancelada");
        }

        const outputText = await executeJavaScript(inputCode, JS_EXEC_TIMEOUT_MS);
        setOutput(outputText);
      },
      toast,
      successMessage: "Código ejecutado correctamente",
      onError: (message) => {
        setError(message.replace(/^Error:\s*/, ""));
      },
    })();
  }, [baseActions, inputCode, setOutput, setError, toast]);

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
    runTransformAction({
      run: async () => {
        const result = await jsService.format(inputCode, {
          indentSize: formatConfig.indentSize,
        });

        if (!result.ok) {
          throw new Error(result.error ?? "Error al formatear código");
        }

        return result.value;
      },
      onSuccess: (value) => {
        setError(null);
        setOutput(value);
        if (formatConfig.autoCopy && value) {
          navigator.clipboard.writeText(value).catch((err) => {
            console.error("Error al copiar al portapapeles: ", err);
          });
        }
      },
      onError: (message) => {
        setError(compactTransformError(message));
      },
      successMessage: "Código formateado correctamente",
      errorMessage: "Error al formatear código",
    });
  }, [runTransformAction, inputCode, formatConfig, setError, setOutput]);

  /**
   * Minify JavaScript code
   */
  const handleMinify = useCallback(() => {
    runTransformAction({
      run: async () => {
        const result = await jsService.minify(inputCode, {
          removeComments: minifyConfig.removeComments,
          removeSpaces: minifyConfig.removeSpaces,
        });

        if (!result.ok) {
          throw new Error(result.error ?? "Error al minificar código");
        }

        return result.value;
      },
      onSuccess: (value) => {
        setError(null);
        setOutput(value);
        if (minifyConfig.autoCopy && value) {
          navigator.clipboard.writeText(value).catch((err) => {
            console.error("Error al copiar al portapapeles: ", err);
          });
        }
      },
      onError: (message) => {
        setError(compactTransformError(message));
      },
      successMessage: "Código minificado correctamente",
      errorMessage: "Error al minificar código",
    });
  }, [runTransformAction, inputCode, minifyConfig, setError, setOutput]);

  return {
    handleClearInput: baseActions.handleClearInput,
    handleLoadExample: baseActions.handleLoadExample,
    handleExecute,
    handleCopyOutput,
    handleDownloadInput,
    handleDownloadOutput,
    handleFormat,
    handleMinify,
  };
}

async function executeJavaScript(code: string, timeoutMs: number): Promise<string> {
  if (typeof Worker === "undefined") {
    return executeJavaScriptSync(code);
  }

  const workerSource = `
    const formatValue = (value) => {
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
    };

    self.onmessage = (event) => {
      const { code } = event.data;
      const logs = [];

      self.console.log = (...args) => {
        logs.push(args.map((arg) => formatValue(arg)).join(" "));
      };
      self.console.error = (...args) => {
        logs.push("ERROR: " + args.map((arg) => formatValue(arg)).join(" "));
      };
      self.console.warn = (...args) => {
        logs.push("WARN: " + args.map((arg) => formatValue(arg)).join(" "));
      };

      try {
        const executeUserCode = new Function(code);
        const result = executeUserCode();
        const outputText = logs.length > 0 ? logs.join("\\n") : "";

        if (result !== undefined && result !== null && logs.length === 0) {
          self.postMessage({ ok: true, output: formatValue(result) });
          return;
        }

        self.postMessage({ ok: true, output: outputText });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        self.postMessage({ ok: false, error: message });
      }
    };
  `;

  return new Promise((resolve, reject) => {
    const blob = new Blob([workerSource], { type: "application/javascript" });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    const cleanup = () => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };

    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("La ejecución superó 5 segundos y fue cancelada"));
    }, timeoutMs);

    worker.onmessage = (event: MessageEvent<{ ok: boolean; output?: string; error?: string }>) => {
      clearTimeout(timeout);
      const data = event.data;
      cleanup();

      if (!data.ok) {
        reject(new Error(data.error ?? "Error desconocido al ejecutar código"));
        return;
      }

      resolve(data.output ?? "");
    };

    worker.onerror = (event) => {
      clearTimeout(timeout);
      cleanup();
      reject(new Error(event.message || "Error en el worker de ejecución"));
    };

    worker.postMessage({ code });
  });
}

function executeJavaScriptSync(code: string): string {
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

    const executeUserCode = new Function(code) as () => unknown;
    const result = executeUserCode();

    const outputText = logs.length > 0 ? logs.join("\n") : "";
    if (result !== undefined && result !== null && logs.length === 0) {
      return formatValue(result);
    }

    return outputText;
  } finally {
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
  }
}

function hasLikelyInfiniteLoop(code: string): boolean {
  const patterns = [
    /while\s*\(\s*true\s*\)/,
    /for\s*\(\s*;\s*;\s*\)/,
    /do\s*\{[\s\S]*\}\s*while\s*\(\s*true\s*\)/,
  ];

  return patterns.some((pattern) => pattern.test(code));
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
