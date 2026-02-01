import { useState, useEffect } from "react";
import { Toolbar } from "@/components/layout/Toolbar";
import { JsonEditors } from "./JsonEditors";
import { jsonPlaygroundConfig } from "./json.config";
import { jsonPathTips, jsonPathQuickExamples } from "./jsonPathTips";
import { formatJson } from "@/services/json/format";
import { useJsonParser } from "@/hooks/useJsonParser";
import { useJsonFormatter } from "@/hooks/useJsonFormatter";
import { useJsonPath } from "@/hooks/useJsonPath";

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
  const [formatConfig, setFormatConfig] = useState(
    savedConfig?.format || {
      indent: 2 as number | "\t",
      sortKeys: false,
      autoCopy: false,
    },
  );
  const [minifyConfig, setMinifyConfig] = useState(
    savedConfig?.minify || {
      removeSpaces: true,
      sortKeys: false,
      autoCopy: false,
    },
  );
  const [cleanConfig, setCleanConfig] = useState(
    savedConfig?.clean || {
      removeNull: true,
      removeUndefined: true,
      removeEmptyString: true,
      removeEmptyArray: false,
      removeEmptyObject: false,
      outputFormat: "format" as "format" | "minify",
      autoCopy: false,
    },
  );

  // Auto-save last JSON to localStorage
  useEffect(() => {
    localStorage.setItem("lastJson", inputJson);
  }, [inputJson]);

  // Use custom hooks for logic encapsulation
  const validation = useJsonParser(inputJson);
  const formatter = useJsonFormatter();
  const jsonPath = useJsonPath();

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
        onFilter={() => jsonPath.filter(inputJson)}
        jsonPathValue={jsonPath.expression}
        onJsonPathChange={jsonPath.setExpression}
        formatConfig={formatConfig}
        onFormatConfigChange={setFormatConfig}
        minifyConfig={minifyConfig}
        onMinifyConfigChange={setMinifyConfig}
        cleanConfig={cleanConfig}
        onCleanConfigChange={setCleanConfig}
        tipsConfig={{
          tips: jsonPathTips,
          quickExamples: jsonPathQuickExamples,
        }}
      />
    </>
  );
}
