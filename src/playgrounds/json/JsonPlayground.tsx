import { useState } from "react";
import { Toolbar } from "@/components/layout/Toolbar";
import { JsonEditors } from "./JsonEditors";
import { jsonPlaygroundConfig } from "./json.config";
import { formatJson } from "@/services/json/format";
import { useJsonParser } from "@/hooks/useJsonParser";
import { useJsonFormatter } from "@/hooks/useJsonFormatter";
import { useJsonPath } from "@/hooks/useJsonPath";

/**
 * JSON Playground - Encapsulated JSON tools
 * Handles formatting, minification, validation and JSONPath filtering
 */
export function JsonPlayground() {
  const [inputJson, setInputJson] = useState("");

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
        onFormat={() => formatter.format(inputJson)}
        onMinify={() => formatter.minify(inputJson)}
        onClean={() => formatter.clean(inputJson)}
        onFilter={() => jsonPath.filter(inputJson)}
        jsonPathValue={jsonPath.expression}
        onJsonPathChange={jsonPath.setExpression}
      />
    </>
  );
}
