import { useState, useEffect } from "react";
import { Toolbar } from "@/components/layout/Toolbar";
import { JsonEditors } from "./JsonEditors";
import { jsonPlaygroundConfig } from "./json.config";
import { jsonPathTips, jsonPathQuickExamples } from "./jsonPathTips";
import { formatJson } from "@/services/json/format";
import { useJsonParser } from "@/hooks/useJsonParser";
import { useJsonFormatter } from "@/hooks/useJsonFormatter";
import { useJsonPath } from "@/hooks/useJsonPath";
import { useJsonPathHistory } from "@/hooks/useJsonPathHistory";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import type { FormatConfig, MinifyConfig, CleanConfig } from "@/types/json";
import {
  DEFAULT_FORMAT_CONFIG,
  DEFAULT_MINIFY_CONFIG,
  DEFAULT_CLEAN_CONFIG,
} from "@/types/json";

// Load config from localStorage
const loadSavedConfig = () => {
  const savedConfig = localStorage.getItem("toolsConfig");
  if (savedConfig) {
    try {
      return JSON.parse(savedConfig);
    } catch (error) {
      console.error("Error loading config from localStorage:", error);
    }
  }
  return null;
};

// Load last JSON from localStorage
const loadLastJson = () => {
  const savedJson = localStorage.getItem("lastJson");
  return savedJson || "";
};

const savedConfig = loadSavedConfig();

/**
 * JSON Playground - Encapsulated JSON tools
 * Handles formatting, minification, validation and JSONPath filtering
 */
export function JsonPlayground() {
  const [inputJson, setInputJson] = useState(loadLastJson);
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
    localStorage.setItem("lastJson", inputJson);
  }, [inputJson]);

  // Use custom hooks for logic encapsulation
  const validation = useJsonParser(inputJson);
  const formatter = useJsonFormatter();
  const jsonPath = useJsonPath();
  const jsonPathHistory = useJsonPathHistory();

  // Determine which output to show (formatter or jsonPath)
  const outputJson = jsonPath.output || formatter.output;
  const outputError = jsonPath.error || formatter.error;

  const handleClearInput = () => {
    setInputJson("");
    formatter.clearOutput();
    jsonPath.clearOutput();
  };

  const handleLoadExample = () => {
    const result = formatJson(jsonPlaygroundConfig.example);
    if (result.ok) {
      setInputJson(result.value);
    } else {
      setInputJson(jsonPlaygroundConfig.example);
    }
    formatter.clearOutput();
    jsonPath.clearOutput();
  };

  const handleCopyOutput = () => {
    const textToCopy = outputJson;
    navigator.clipboard.writeText(textToCopy).catch((err) => {
      console.error("Error al copiar al portapapeles: ", err);
    });
  };

  const handleApplyJsonPath = () => {
    const result = jsonPath.filter(inputJson);
    if (result.ok) {
      jsonPathHistory.addToHistory(jsonPath.expression);
    }
  };

  const handleReuseFromHistory = (expression: string) => {
    jsonPath.setExpression(expression);
    const result = jsonPath.filter(inputJson, expression);
    if (result.ok) {
      jsonPathHistory.addToHistory(expression);
    }
  };

  // Setup keyboard shortcuts - need to be defined before useKeyboardShortcuts
  const [showConfig, setShowConfig] = useState(false);

  useKeyboardShortcuts({
    onFormat: () => formatter.format(inputJson, formatConfig),
    onMinify: () => formatter.minify(inputJson, minifyConfig),
    onClean: () => formatter.clean(inputJson, cleanConfig),
    onCopyOutput: handleCopyOutput,
    onClearInput: handleClearInput,
    onOpenConfig: () => setShowConfig(true),
  });

  return (
    <>
      <JsonEditors
        inputValue={inputJson}
        outputValue={outputJson}
        validationState={validation}
        outputError={outputError}
        onInputChange={setInputJson}
        onClearInput={handleClearInput}
        onLoadExample={handleLoadExample}
        onCopyOutput={handleCopyOutput}
      />

      <Toolbar
        onFormat={() => formatter.format(inputJson, formatConfig)}
        onMinify={() => formatter.minify(inputJson, minifyConfig)}
        onClean={() => formatter.clean(inputJson, cleanConfig)}
        onFilter={handleApplyJsonPath}
        jsonPathValue={jsonPath.expression}
        onJsonPathChange={jsonPath.setExpression}
        formatConfig={formatConfig}
        onFormatConfigChange={setFormatConfig}
        minifyConfig={minifyConfig}
        onMinifyConfigChange={setMinifyConfig}
        cleanConfig={cleanConfig}
        onCleanConfigChange={setCleanConfig}
        configIsOpen={showConfig}
        onConfigOpen={setShowConfig}
        jsonPathHistory={jsonPathHistory.history}
        onHistoryReuse={handleReuseFromHistory}
        onHistoryDelete={jsonPathHistory.removeFromHistory}
        onHistoryClear={jsonPathHistory.clearHistory}
        tipsConfig={{
          tips: jsonPathTips,
          quickExamples: jsonPathQuickExamples,
        }}
      />
    </>
  );
}
