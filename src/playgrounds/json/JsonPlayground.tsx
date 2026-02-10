import { useState, useEffect, useCallback } from "react";
import { Toolbar } from "@/components/layout/Toolbar";
import { JsonEditors } from "./JsonEditors";
import { jsonPathTips, jsonPathQuickExamples } from "./jsonPathTips";
import { useJsonParser } from "@/hooks/useJsonParser";
import { useJsonFormatter } from "@/hooks/useJsonFormatter";
import { useJsonPath } from "@/hooks/useJsonPath";
import { useJsonPathHistory } from "@/hooks/useJsonPathHistory";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useJsonPlaygroundActions } from "@/hooks/useJsonPlaygroundActions";
import { useToast } from "@/hooks/useToast";
import { downloadFile } from "@/utils/download";
import type { FormatConfig, MinifyConfig, CleanConfig } from "@/types/json";
import {
  DEFAULT_FORMAT_CONFIG,
  DEFAULT_MINIFY_CONFIG,
  DEFAULT_CLEAN_CONFIG,
} from "@/types/json";
import {
  loadToolsConfig,
  loadLastJson,
  saveLastJson,
} from "@/services/storage";

const savedConfig = loadToolsConfig();

/**
 * JSON Playground - Encapsulated JSON tools
 * Handles formatting, minification, validation and JSONPath filtering
 */
export function JsonPlayground() {
  const [inputJson, setInputJson] = useState<string>(() => loadLastJson());
  const [formatConfig, setFormatConfig] = useState<FormatConfig>(
    savedConfig?.format || DEFAULT_FORMAT_CONFIG,
  );
  const [minifyConfig, setMinifyConfig] = useState<MinifyConfig>(
    savedConfig?.minify || DEFAULT_MINIFY_CONFIG,
  );
  const [cleanConfig, setCleanConfig] = useState<CleanConfig>(
    savedConfig?.clean || DEFAULT_CLEAN_CONFIG,
  );

  // Auto-save last JSON to localStorage
  useEffect(() => {
    saveLastJson(inputJson);
  }, [inputJson]);

  // Use custom hooks for logic encapsulation
  const validation = useJsonParser(inputJson);
  const formatter = useJsonFormatter();
  const jsonPath = useJsonPath();
  const jsonPathHistory = useJsonPathHistory();

  // Determine which output to show (formatter or jsonPath)
  const outputJson = jsonPath.output || formatter.output;
  const outputError = jsonPath.error || formatter.error;

  // Setup keyboard shortcuts - need to be defined before useKeyboardShortcuts
  const [showConfig, setShowConfig] = useState(false);
  const toast = useToast();

  // Encapsulate all handlers
  const {
    handleClearInput,
    handleLoadExample,
    handleFormat,
    handleMinify,
    handleClean,
    handleApplyJsonPath,
    handleReuseFromHistory,
  } = useJsonPlaygroundActions({
    inputJson,
    setInputJson,
    // Formatter functions
    formatterOutput: formatter.output,
    clearFormatterOutput: formatter.clearOutput,
    formatFn: formatter.format,
    minifyFn: formatter.minify,
    cleanFn: formatter.clean,
    // JsonPath functions
    jsonPathOutput: jsonPath.output,
    jsonPathExpression: jsonPath.expression,
    setJsonPathExpression: jsonPath.setExpression,
    clearJsonPathOutput: jsonPath.clearOutput,
    filterJsonPath: jsonPath.filter,
    // JsonPathHistory function
    addToHistory: jsonPathHistory.addToHistory,
    // Configs
    formatConfig,
    minifyConfig,
    cleanConfig,
    // Toast
    toast,
  });

  // Wrapper para handleCopyOutput con toast
  const handleCopyOutputWithToast = useCallback(() => {
    const textToCopy = outputJson;
    if (!textToCopy) {
      toast.error("No hay contenido para copiar");
      return;
    }
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        toast.success("Copiado al portapapeles");
      })
      .catch(() => {
        toast.error("Error al copiar al portapapeles");
      });
  }, [outputJson, toast]);

  const handleDownloadInput = useCallback(() => {
    if (!inputJson) {
      toast.error("No hay contenido para descargar");
      return;
    }
    downloadFile(inputJson, "data.json", "application/json");
    toast.success("Descargado como data.json");
  }, [inputJson, toast]);

  const handleDownloadOutput = useCallback(() => {
    if (!outputJson) {
      toast.error("No hay resultado para descargar");
      return;
    }
    downloadFile(outputJson, "result.json", "application/json");
    toast.success("Descargado como result.json");
  }, [outputJson, toast]);

  useKeyboardShortcuts({
    onFormat: handleFormat,
    onMinify: handleMinify,
    onClean: handleClean,
    onCopyOutput: handleCopyOutputWithToast,
    onClearInput: handleClearInput,
    onOpenConfig: () => setShowConfig(true),
  });

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-4">
      <JsonEditors
        inputValue={inputJson}
        outputValue={outputJson}
        validationState={validation}
        outputError={outputError}
        onInputChange={setInputJson}
        onClearInput={handleClearInput}
        onLoadExample={handleLoadExample}
        onCopyOutput={handleCopyOutputWithToast}
        onDownloadInput={handleDownloadInput}
        onDownloadOutput={handleDownloadOutput}
      />

      <Toolbar
        variant="json"
        actions={{
          onFormat: handleFormat,
          onMinify: handleMinify,
          onClean: handleClean,
          onFilter: handleApplyJsonPath,
        }}
        jsonPath={{
          value: jsonPath.expression,
          onChange: jsonPath.setExpression,
        }}
        history={{
          items: jsonPathHistory.history,
          onReuse: handleReuseFromHistory,
          onDelete: jsonPathHistory.removeFromHistory,
          onClear: jsonPathHistory.clearHistory,
        }}
        config={{
          format: formatConfig,
          onFormatChange: setFormatConfig,
          minify: minifyConfig,
          onMinifyChange: setMinifyConfig,
          clean: cleanConfig,
          onCleanChange: setCleanConfig,
          isOpen: showConfig,
          onOpenChange: setShowConfig,
        }}
        tips={{
          config: {
            tips: jsonPathTips,
            quickExamples: jsonPathQuickExamples,
          },
        }}
      />
    </div>
  );
}
