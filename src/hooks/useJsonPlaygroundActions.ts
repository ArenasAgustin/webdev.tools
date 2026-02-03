import { useCallback } from "react";
import { jsonPlaygroundConfig } from "@/playgrounds/json/json.config";
import { formatJson } from "@/services/json/format";
import type { FormatConfig, MinifyConfig, CleanConfig } from "@/types/json";

interface UseJsonPlaygroundActionsProps {
  inputJson: string;
  setInputJson: (value: string) => void;
  formatter: {
    output: string;
    clearOutput: () => void;
    format: (input: string, options?: Partial<FormatConfig>) => void;
    minify: (input: string, options?: Partial<MinifyConfig>) => void;
    clean: (input: string, options?: Partial<CleanConfig>) => void;
  };
  jsonPath: {
    output: string;
    expression: string;
    setExpression: (expr: string) => void;
    clearOutput: () => void;
    filter: (
      input: string,
      overrideExpression?: string,
    ) => {
      ok: boolean;
      error?: string;
    };
  };
  jsonPathHistory: {
    addToHistory: (expression: string) => Promise<void> | void;
  };
  formatConfig: FormatConfig;
  minifyConfig: MinifyConfig;
  cleanConfig: CleanConfig;
}

export function useJsonPlaygroundActions({
  inputJson,
  setInputJson,
  formatter,
  jsonPath,
  jsonPathHistory,
  formatConfig,
  minifyConfig,
  cleanConfig,
}: UseJsonPlaygroundActionsProps) {
  const handleClearInput = useCallback(() => {
    setInputJson("");
    formatter.clearOutput();
    jsonPath.clearOutput();
  }, [setInputJson, formatter, jsonPath]);

  const handleLoadExample = useCallback(() => {
    const result = formatJson(jsonPlaygroundConfig.example);
    if (result.ok) {
      setInputJson(result.value);
    } else {
      setInputJson(jsonPlaygroundConfig.example);
    }
    formatter.clearOutput();
    jsonPath.clearOutput();
  }, [setInputJson, formatter, jsonPath]);

  const handleCopyOutput = useCallback(() => {
    const textToCopy = jsonPath.output || formatter.output;
    navigator.clipboard.writeText(textToCopy).catch((err) => {
      console.error("Error al copiar al portapapeles: ", err);
    });
  }, [formatter.output, jsonPath.output]);

  const handleFormat = useCallback(() => {
    formatter.format(inputJson, formatConfig);
  }, [inputJson, formatter, formatConfig]);

  const handleMinify = useCallback(() => {
    formatter.minify(inputJson, minifyConfig);
  }, [inputJson, formatter, minifyConfig]);

  const handleClean = useCallback(() => {
    formatter.clean(inputJson, cleanConfig);
  }, [inputJson, formatter, cleanConfig]);

  const handleApplyJsonPath = useCallback(() => {
    const result = jsonPath.filter(inputJson);
    if (result.ok) {
      jsonPathHistory.addToHistory(jsonPath.expression);
    }
  }, [inputJson, jsonPath, jsonPathHistory]);

  const handleReuseFromHistory = useCallback(
    (expression: string) => {
      jsonPath.setExpression(expression);
      const result = jsonPath.filter(inputJson, expression);
      if (result.ok) {
        jsonPathHistory.addToHistory(expression);
      }
    },
    [inputJson, jsonPath, jsonPathHistory],
  );

  return {
    handleClearInput,
    handleLoadExample,
    handleCopyOutput,
    handleFormat,
    handleMinify,
    handleClean,
    handleApplyJsonPath,
    handleReuseFromHistory,
  };
}
