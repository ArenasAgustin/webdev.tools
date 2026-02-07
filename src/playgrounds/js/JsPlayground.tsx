import { useState, useCallback } from "react";
import { Button } from "@/components/common/Button";
import { JsEditors } from "./JsEditors";
import { jsPlaygroundConfig } from "./js.config";
import { minifyJs } from "@/services/js/minify";
import { formatJs } from "@/services/js/format";

// Disable React Compiler optimization for this component due to dynamic code execution
/** @react-compiler-skip */

/**
 * JavaScript Playground - Execute and test JavaScript code
 */
export function JsPlayground() {
  const [inputCode, setInputCode] = useState<string>(
    jsPlaygroundConfig.example,
  );
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

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

  // Minify JavaScript code
  const handleMinify = useCallback(() => {
    const result = minifyJs(inputCode);
    if (result.ok) {
      setInputCode(result.value);
      setError(null);
      setOutput("");
    } else {
      setError(result.error);
    }
  }, [inputCode]);

  // Format JavaScript code
  const handleFormat = useCallback(() => {
    const result = formatJs(inputCode);
    if (result.ok) {
      setInputCode(result.value);
      setError(null);
      setOutput("");
    } else {
      setError(result.error);
    }
  }, [inputCode]);

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-4">
      <JsEditors
        inputCode={inputCode}
        output={output}
        error={error}
        onInputChange={setInputCode}
        onCopyInput={handleCopyInput}
        onCopyOutput={handleCopyOutput}
      />

      {/* Toolbar */}
      <section className="mt-2 sm:mt-4 bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-xl border border-white/5 sticky bottom-0 z-10 shrink-0">
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {/* Action Buttons */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <i className="fas fa-tools text-yellow-400"></i> Herramientas
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
              <Button variant="orange" size="md" onClick={executeCode}>
                <i className="fas fa-play mr-1"></i> Ejecutar
              </Button>
              <Button variant="primary" size="md" onClick={handleFormat}>
                <i className="fas fa-indent mr-1"></i> Formatear
              </Button>
              <Button variant="purple" size="md" onClick={handleMinify}>
                <i className="fas fa-compress mr-1"></i> Minificar
              </Button>
              <Button variant="danger" size="md" onClick={handleClearInput}>
                <i className="fas fa-trash mr-1"></i> Limpiar
              </Button>
              <Button variant="success" size="md" onClick={handleLoadExample}>
                <i className="fas fa-file-import mr-1"></i> Ejemplo
              </Button>
            </div>
          </div>
        </div>
      </section>
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
