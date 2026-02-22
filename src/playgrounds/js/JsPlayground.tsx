import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { ConfigModal } from "@/components/common/ConfigModal";
import { Toolbar } from "@/components/layout/Toolbar";
import { JsEditors } from "./JsEditors";
import { jsPlaygroundConfig } from "./js.config";
import { minifyJsAsync, formatJsAsync } from "@/services/js/worker";
import { downloadFile } from "@/utils/download";
import { useToast } from "@/hooks/useToast";
import { useModalState } from "@/hooks/useModalState";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useTextStats } from "@/hooks/useTextStats";
import { createValidatedHandler } from "@/utils/handlerFactory";
import { MAX_INPUT_BYTES, MAX_INPUT_LABEL } from "@/utils/constants/limits";
import { loadLastJs, saveLastJs, loadJsToolsConfig } from "@/services/storage";
import type { JsFormatConfig, JsMinifyConfig } from "@/types/js";
import { DEFAULT_JS_FORMAT_CONFIG, DEFAULT_JS_MINIFY_CONFIG } from "@/types/js";

const savedConfig = loadJsToolsConfig();

// Disable React Compiler optimization for this component due to dynamic code execution
/** @react-compiler-skip */

/**
 * JavaScript Playground - Execute and test JavaScript code
 */
export function JsPlayground() {
  const [inputCode, setInputCode] = useState<string>(
    () => loadLastJs() || jsPlaygroundConfig.example,
  );
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [formatConfig, setFormatConfig] = useState<JsFormatConfig>(
    savedConfig?.format ?? DEFAULT_JS_FORMAT_CONFIG,
  );
  const [minifyConfig, setMinifyConfig] = useState<JsMinifyConfig>(
    savedConfig?.minify ?? DEFAULT_JS_MINIFY_CONFIG,
  );

  // Modal state management
  const configModal = useModalState();

  const debouncedInputCode = useDebouncedValue(inputCode, 300);
  const inputStats = useTextStats(inputCode);
  const inputTooLarge = inputStats.bytes > MAX_INPUT_BYTES;
  const inputWarning = inputTooLarge
    ? "Entrada grande: algunas operaciones pueden ser lentas"
    : null;
  const sizeWarningShown = useRef(false);

  useEffect(() => {
    saveLastJs(debouncedInputCode);
  }, [debouncedInputCode]);

  const toast = useToast();

  useEffect(() => {
    if (inputTooLarge && !sizeWarningShown.current) {
      toast.info(`El contenido supera ${MAX_INPUT_LABEL}. Algunas operaciones pueden ser lentas.`);
      sizeWarningShown.current = true;
    }

    if (!inputTooLarge) {
      sizeWarningShown.current = false;
    }
  }, [inputTooLarge, toast]);

  const validateInputSize = useCallback(
    () =>
      inputTooLarge
        ? `El contenido supera ${MAX_INPUT_LABEL}. Reduce el tamano para procesarlo.`
        : null,
    [inputTooLarge],
  );

  // Execute the JavaScript code
  const executeCode = useCallback(() => {
    createValidatedHandler({
      validate: validateInputSize,
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
  }, [inputCode, toast, validateInputSize]);

  // Clear input code
  const handleClearInput = useCallback(() => {
    setInputCode("");
    setOutput("");
    setError(null);
    toast.success("Código limpiado");
  }, [toast]);

  // Load example code
  const handleLoadExample = useCallback(() => {
    setInputCode(jsPlaygroundConfig.example);
    setOutput("");
    setError(null);
    toast.success("Ejemplo cargado");
  }, [toast]);

  // Copy input to clipboard
  const handleCopyInput = useCallback(() => {
    createValidatedHandler({
      validate: () => (!inputCode ? "No hay código para copiar" : null),
      run: async () => {
        await navigator.clipboard.writeText(inputCode);
      },
      toast,
      successMessage: "Código copiado al portapapeles",
      errorMessage: "Error al copiar al portapapeles",
    })();
  }, [inputCode, toast]);

  // Copy output to clipboard
  const handleCopyOutput = useCallback(() => {
    createValidatedHandler({
      validate: () => (!output ? "No hay resultado para copiar" : null),
      run: async () => {
        await navigator.clipboard.writeText(output);
      },
      toast,
      successMessage: "Resultado copiado al portapapeles",
      errorMessage: "Error al copiar al portapapeles",
    })();
  }, [output, toast]);

  // Download input code
  const handleDownloadInput = useCallback(() => {
    createValidatedHandler({
      validate: () => (!inputCode ? "No hay código para descargar" : null),
      run: () => {
        downloadFile(inputCode, "code.js", "application/javascript");
      },
      toast,
      successMessage: "Descargado como code.js",
    })();
  }, [inputCode, toast]);

  // Download output
  const handleDownloadOutput = useCallback(() => {
    createValidatedHandler({
      validate: () => (!output ? "No hay resultado para descargar" : null),
      run: () => {
        downloadFile(output, "output.txt", "text/plain");
      },
      toast,
      successMessage: "Descargado como output.txt",
    })();
  }, [output, toast]);

  // Minify JavaScript code
  const handleMinify = useCallback(() => {
    createValidatedHandler({
      validate: validateInputSize,
      run: async () => {
        const result = await minifyJsAsync(inputCode, {
          removeComments: minifyConfig.removeComments,
          removeSpaces: minifyConfig.removeSpaces,
        });

        if (!result.ok) {
          throw new Error(result.error || "Error al minificar código");
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
  }, [inputCode, minifyConfig, toast, validateInputSize]);

  // Format JavaScript code
  const handleFormat = useCallback(() => {
    createValidatedHandler({
      validate: validateInputSize,
      run: async () => {
        const result = await formatJsAsync(inputCode, formatConfig.indentSize);

        if (!result.ok) {
          throw new Error(result.error || "Error al formatear código");
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
  }, [inputCode, formatConfig, toast, validateInputSize]);

  // Memoize complex toolbar configuration to prevent re-renders
  const toolbarTools = useMemo(
    () => ({
      actions: [
        {
          label: "Ejecutar",
          icon: "play" as const,
          variant: "orange" as const,
          onClick: executeCode,
        },
        {
          label: "Formatear",
          icon: "indent" as const,
          variant: "primary" as const,
          onClick: handleFormat,
        },
        {
          label: "Minificar",
          icon: "compress" as const,
          variant: "purple" as const,
          onClick: handleMinify,
        },
        {
          label: "Limpiar",
          icon: "trash" as const,
          variant: "danger" as const,
          onClick: handleClearInput,
        },
        {
          label: "Ejemplo",
          icon: "file-import" as const,
          variant: "success" as const,
          onClick: handleLoadExample,
        },
      ],
      onOpenConfig: configModal.open,
      configButtonTitle: "Configurar herramientas",
      gridClassName: "grid grid-cols-2 lg:grid-cols-5 gap-2",
    }),
    [
      executeCode,
      handleFormat,
      handleMinify,
      handleClearInput,
      handleLoadExample,
      configModal.open,
    ],
  );

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-4">
      <JsEditors
        inputCode={inputCode}
        output={output}
        error={error}
        inputWarning={inputWarning}
        onInputChange={setInputCode}
        onCopyInput={handleCopyInput}
        onCopyOutput={handleCopyOutput}
        onDownloadInput={handleDownloadInput}
        onDownloadOutput={handleDownloadOutput}
      />

      <Toolbar variant="generic" tools={toolbarTools} />

      <ConfigModal
        mode="js"
        isOpen={configModal.isOpen}
        onClose={configModal.close}
        formatConfig={formatConfig}
        onFormatConfigChange={setFormatConfig}
        minifyConfig={minifyConfig}
        onMinifyConfigChange={setMinifyConfig}
      />
    </div>
  );
}

/**
 * Format values for display
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
