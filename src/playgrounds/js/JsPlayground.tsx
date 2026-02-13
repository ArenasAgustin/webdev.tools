import { useState, useCallback, useEffect, useRef } from "react";
import { JsConfigModal } from "@/components/common/JsConfigModal";
import { Toolbar } from "@/components/layout/Toolbar";
import { JsEditors } from "./JsEditors";
import { jsPlaygroundConfig } from "./js.config";
import { minifyJs } from "@/services/js/minify";
import { formatJs } from "@/services/js/format";
import { downloadFile } from "@/utils/download";
import { useToast } from "@/hooks/useToast";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useTextStats } from "@/hooks/useTextStats";
import { MAX_INPUT_BYTES, MAX_INPUT_LABEL } from "@/utils/constants/limits";
import { loadLastJs, saveLastJs, loadJsToolsConfig, saveJsToolsConfig } from "@/services/storage";
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
  const [showConfig, setShowConfig] = useState(false);

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

  useEffect(() => {
    saveJsToolsConfig({ format: formatConfig, minify: minifyConfig });
  }, [formatConfig, minifyConfig]);

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

  const guardInputSize = useCallback(() => {
    if (!inputTooLarge) {
      return false;
    }

    toast.error(`El contenido supera ${MAX_INPUT_LABEL}. Reduce el tamano para procesarlo.`);
    return true;
  }, [inputTooLarge, toast]);

  // Execute the JavaScript code
  const executeCode = useCallback(() => {
    if (guardInputSize()) {
      return;
    }

    setError(null);
    setOutput("");

    try {
      const logs: string[] = [];
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;

      // Intercept console methods
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

      // Execute code using Function constructor (safer than eval)
      const executeUserCode = new Function(inputCode) as () => unknown;
      const result = executeUserCode();

      // Restore console
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;

      // Set output
      const outputText = logs.length > 0 ? logs.join("\n") : "";
      if (result !== undefined && result !== null && logs.length === 0) {
        setOutput(formatValue(result));
      } else {
        setOutput(outputText);
      }
      toast.success("Código ejecutado correctamente");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      toast.error(`Error: ${errorMsg}`);
    }
  }, [inputCode, toast, guardInputSize]);

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
    if (!inputCode) {
      toast.error("No hay código para copiar");
      return;
    }
    navigator.clipboard
      .writeText(inputCode)
      .then(() => {
        toast.success("Código copiado al portapapeles");
      })
      .catch(() => {
        toast.error("Error al copiar al portapapeles");
      });
  }, [inputCode, toast]);

  // Copy output to clipboard
  const handleCopyOutput = useCallback(() => {
    if (!output) {
      toast.error("No hay resultado para copiar");
      return;
    }
    navigator.clipboard
      .writeText(output)
      .then(() => {
        toast.success("Resultado copiado al portapapeles");
      })
      .catch(() => {
        toast.error("Error al copiar al portapapeles");
      });
  }, [output, toast]);

  // Download input code
  const handleDownloadInput = useCallback(() => {
    if (!inputCode) {
      toast.error("No hay código para descargar");
      return;
    }
    downloadFile(inputCode, "code.js", "application/javascript");
    toast.success("Descargado como code.js");
  }, [inputCode, toast]);

  // Download output
  const handleDownloadOutput = useCallback(() => {
    if (!output) {
      toast.error("No hay resultado para descargar");
      return;
    }
    downloadFile(output, "output.txt", "text/plain");
    toast.success("Descargado como output.txt");
  }, [output, toast]);

  // Minify JavaScript code
  const handleMinify = useCallback(() => {
    if (guardInputSize()) {
      return;
    }

    const result = minifyJs(inputCode, {
      removeComments: minifyConfig.removeComments,
      removeSpaces: minifyConfig.removeSpaces,
    });
    if (result.ok) {
      setInputCode(result.value);
      setError(null);
      setOutput("");
      if (minifyConfig.autoCopy && result.value) {
        navigator.clipboard.writeText(result.value).catch((err) => {
          console.error("Error al copiar al portapapeles: ", err);
        });
      }
      toast.success("Código minificado correctamente");
    } else {
      setError(result.error);
      toast.error(result.error || "Error al minificar código");
    }
  }, [inputCode, minifyConfig, toast, guardInputSize]);

  // Format JavaScript code
  const handleFormat = useCallback(() => {
    if (guardInputSize()) {
      return;
    }

    const result = formatJs(inputCode, formatConfig.indentSize);
    if (result.ok) {
      setInputCode(result.value);
      setError(null);
      setOutput("");
      if (formatConfig.autoCopy && result.value) {
        navigator.clipboard.writeText(result.value).catch((err) => {
          console.error("Error al copiar al portapapeles: ", err);
        });
      }
      toast.success("Código formateado correctamente");
    } else {
      setError(result.error);
      toast.error(result.error || "Error al formatear código");
    }
  }, [inputCode, formatConfig, toast, guardInputSize]);

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

      <Toolbar
        variant="generic"
        tools={{
          actions: [
            {
              label: "Ejecutar",
              icon: "play",
              variant: "orange",
              onClick: executeCode,
            },
            {
              label: "Formatear",
              icon: "indent",
              variant: "primary",
              onClick: handleFormat,
            },
            {
              label: "Minificar",
              icon: "compress",
              variant: "purple",
              onClick: handleMinify,
            },
            {
              label: "Limpiar",
              icon: "trash",
              variant: "danger",
              onClick: handleClearInput,
            },
            {
              label: "Ejemplo",
              icon: "file-import",
              variant: "success",
              onClick: handleLoadExample,
            },
          ],
          onOpenConfig: () => setShowConfig(true),
          configButtonTitle: "Configurar herramientas",
          gridClassName: "grid grid-cols-2 lg:grid-cols-5 gap-2",
        }}
      />

      <JsConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
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
