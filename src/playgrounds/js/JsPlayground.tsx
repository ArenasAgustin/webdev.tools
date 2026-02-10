import { useState, useCallback, useEffect } from "react";
import { JsConfigModal } from "@/components/common/JsConfigModal";
import { Toolbar } from "@/components/layout/Toolbar";
import { JsEditors } from "./JsEditors";
import { jsPlaygroundConfig } from "./js.config";
import { minifyJs } from "@/services/js/minify";
import { formatJs } from "@/services/js/format";
import { downloadFile } from "@/utils/download";
import {
  loadLastJs,
  saveLastJs,
  loadJsToolsConfig,
  saveJsToolsConfig,
} from "@/services/storage";
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
    savedConfig?.format || DEFAULT_JS_FORMAT_CONFIG,
  );
  const [minifyConfig, setMinifyConfig] = useState<JsMinifyConfig>(
    savedConfig?.minify || DEFAULT_JS_MINIFY_CONFIG,
  );
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    saveLastJs(inputCode);
  }, [inputCode]);

  useEffect(() => {
    saveJsToolsConfig({ format: formatConfig, minify: minifyConfig });
  }, [formatConfig, minifyConfig]);

  // Execute the JavaScript code
  const executeCode = useCallback(() => {
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
      const executeUserCode = new Function(inputCode);
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
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
    }
  }, [inputCode]);

  // Clear input code
  const handleClearInput = useCallback(() => {
    setInputCode("");
    setOutput("");
    setError(null);
  }, []);

  // Load example code
  const handleLoadExample = useCallback(() => {
    setInputCode(jsPlaygroundConfig.example);
    setOutput("");
    setError(null);
  }, []);

  // Copy input to clipboard
  const handleCopyInput = useCallback(() => {
    if (inputCode) {
      navigator.clipboard.writeText(inputCode);
    }
  }, [inputCode]);

  // Copy output to clipboard
  const handleCopyOutput = useCallback(() => {
    if (output) {
      navigator.clipboard.writeText(output);
    }
  }, [output]);

  // Download input code
  const handleDownloadInput = useCallback(() => {
    downloadFile(inputCode, "code.js", "application/javascript");
  }, [inputCode]);

  // Minify JavaScript code
  const handleMinify = useCallback(() => {
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
    } else {
      setError(result.error);
    }
  }, [inputCode, minifyConfig]);

  // Format JavaScript code
  const handleFormat = useCallback(() => {
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
    } else {
      setError(result.error);
    }
  }, [inputCode, formatConfig]);

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-4">
      <JsEditors
        inputCode={inputCode}
        output={output}
        error={error}
        onInputChange={setInputCode}
        onCopyInput={handleCopyInput}
        onCopyOutput={handleCopyOutput}
        onDownloadInput={handleDownloadInput}
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
      return String(value);
    }
  }
  return String(value);
}
