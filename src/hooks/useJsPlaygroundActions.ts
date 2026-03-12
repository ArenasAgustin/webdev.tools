import { useCallback } from "react";
import { jsPlaygroundConfig } from "@/playgrounds/js/js.config";
import { jsService } from "@/services/js/service";
import { createValidatedHandler } from "@/utils/handlerFactory";
import {
  useGenericPlaygroundActions,
  type PlaygroundFileConfig,
} from "./useGenericPlaygroundActions";
import type { ToastApi } from "./usePlaygroundActions";
import type { JsFormatConfig, JsMinifyConfig } from "@/types/js";

const JS_EXEC_TIMEOUT_MS = 5000;

const FILE_CONFIG: PlaygroundFileConfig = {
  inputFileName: "code.js",
  outputFileName: "output.txt",
  mimeType: "application/javascript",
  language: "Código",
};

async function formatRunner(input: string, config: JsFormatConfig) {
  const result = await jsService.format(input, { indentSize: config.indentSize });
  if (!result.ok) throw new Error(result.error ?? "Error al formatear código");
  return result.value;
}

async function minifyRunner(input: string, config: JsMinifyConfig) {
  const result = await jsService.minify(input, {
    removeComments: config.removeComments,
    removeSpaces: config.removeSpaces,
  });
  if (!result.ok) throw new Error(result.error ?? "Error al minificar código");
  return result.value;
}

interface UseJsPlaygroundActionsProps {
  inputJs: string;
  setInputJs: (value: string) => void;
  output: string;
  setOutput: (value: string) => void;
  setError: (error: string | null) => void;
  inputTooLarge?: boolean;
  inputTooLargeMessage?: string;
  formatConfig: JsFormatConfig;
  minifyConfig: JsMinifyConfig;
  toast?: ToastApi;
}

export function useJsPlaygroundActions({
  inputJs,
  setInputJs,
  output,
  setOutput,
  setError,
  inputTooLarge,
  inputTooLargeMessage,
  formatConfig,
  minifyConfig,
  toast,
}: UseJsPlaygroundActionsProps) {
  const generic = useGenericPlaygroundActions({
    input: inputJs,
    setInput: setInputJs,
    output,
    setOutput,
    setError,
    inputTooLarge,
    inputTooLargeMessage,
    formatConfig,
    minifyConfig,
    toast,
    exampleContent: jsPlaygroundConfig.example,
    fileConfig: FILE_CONFIG,
    formatRunner,
    minifyRunner,
  });

  // Extensión: ejecutar código JS
  const handleExecute = useCallback(() => {
    createValidatedHandler({
      validate: generic.baseActions.createInputValidator,
      run: async () => {
        setError(null);
        setOutput("");

        if (hasLikelyInfiniteLoop(inputJs)) {
          throw new Error("La ejecución superó 5 segundos y fue cancelada");
        }

        const outputText = await executeJavaScript(inputJs, JS_EXEC_TIMEOUT_MS);
        setOutput(outputText);
      },
      toast,
      successMessage: "Código ejecutado correctamente",
      onError: (message) => {
        setError(message.replace(/^Error:\s*/, ""));
      },
    })();
  }, [generic.baseActions, inputJs, setOutput, setError, toast]);

  return {
    ...generic,
    handleExecute,
  };
}

function hasLikelyInfiniteLoop(code: string): boolean {
  const patterns = [
    /while\s*\(\s*true\s*\)/,
    /for\s*\(\s*;\s*;\s*\)/,
    /do\s*\{[\s\S]*\}\s*while\s*\(\s*true\s*\)/,
  ];
  return patterns.some((pattern) => pattern.test(code));
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
        const outputText = logs.length > 0 ? logs.join("\n") : "";
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
    worker.onerror = (event: ErrorEvent) => {
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
