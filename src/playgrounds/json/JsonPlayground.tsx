import { useState } from "react";
import { Toolbar } from "@/components/layout/Toolbar";
import { JsonEditors } from "./JsonEditors";
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

  return (
    <>
      <JsonEditors
        inputValue={inputJson}
        outputValue={outputJson}
        validationState={validation}
        outputError={outputError}
        onInputChange={setInputJson}
        onClearInput={handleClearInput}
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
