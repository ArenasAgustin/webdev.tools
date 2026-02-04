import { useCallback } from "react";
import { jsonPlaygroundConfig } from "@/playgrounds/json/json.config";
import { formatJson } from "@/services/json/format";
import type { FormatConfig, MinifyConfig, CleanConfig } from "@/types/json";

interface UseJsonPlaygroundActionsProps {
  inputJson: string;
  setInputJson: (value: string) => void;
  // Formatter functions (instead of the whole object)
  formatterOutput: string;
  clearFormatterOutput: () => void;
  formatFn: (input: string, options?: Partial<FormatConfig>) => void;
  minifyFn: (input: string, options?: Partial<MinifyConfig>) => void;
  cleanFn: (input: string, options?: Partial<CleanConfig>) => void;
  // JsonPath functions (instead of the whole object)
  jsonPathOutput: string;
  jsonPathExpression: string;
  setJsonPathExpression: (expr: string) => void;
  clearJsonPathOutput: () => void;
  filterJsonPath: (
    input: string,
    overrideExpression?: string,
  ) => {
    ok: boolean;
    error?: string;
  };
  // JsonPathHistory function
  addToHistory: (expression: string) => Promise<void> | void;
  // Configs
  formatConfig: FormatConfig;
  minifyConfig: MinifyConfig;
  cleanConfig: CleanConfig;
}

export function useJsonPlaygroundActions({
  inputJson,
  setInputJson,
  formatterOutput,
  clearFormatterOutput,
  formatFn,
  minifyFn,
  cleanFn,
  jsonPathOutput,
  jsonPathExpression,
  setJsonPathExpression,
  clearJsonPathOutput,
  filterJsonPath,
  addToHistory,
  formatConfig,
  minifyConfig,
  cleanConfig,
}: UseJsonPlaygroundActionsProps) {
  const handleClearInput = useCallback(() => {
    setInputJson("");
    clearFormatterOutput();
    clearJsonPathOutput();
  }, [setInputJson, clearFormatterOutput, clearJsonPathOutput]);

  const handleLoadExample = useCallback(() => {
    const result = formatJson(jsonPlaygroundConfig.example);
    if (result.ok) {
      setInputJson(result.value);
    } else {
      setInputJson(jsonPlaygroundConfig.example);
    }
    clearFormatterOutput();
    clearJsonPathOutput();
  }, [setInputJson, clearFormatterOutput, clearJsonPathOutput]);

  const handleCopyOutput = useCallback(() => {
    const textToCopy = jsonPathOutput || formatterOutput;
    navigator.clipboard.writeText(textToCopy).catch((err) => {
      console.error("Error al copiar al portapapeles: ", err);
    });
  }, [formatterOutput, jsonPathOutput]);

  const handleFormat = useCallback(() => {
    formatFn(inputJson, formatConfig);
  }, [inputJson, formatFn, formatConfig]);

  const handleMinify = useCallback(() => {
    minifyFn(inputJson, minifyConfig);
  }, [inputJson, minifyFn, minifyConfig]);

  const handleClean = useCallback(() => {
    cleanFn(inputJson, cleanConfig);
  }, [inputJson, cleanFn, cleanConfig]);

  const handleApplyJsonPath = useCallback(() => {
    const result = filterJsonPath(inputJson);
    if (result.ok) {
      addToHistory(jsonPathExpression);
    }
  }, [inputJson, filterJsonPath, addToHistory, jsonPathExpression]);

  const handleReuseFromHistory = useCallback(
    (expression: string) => {
      setJsonPathExpression(expression);
      const result = filterJsonPath(inputJson, expression);
      if (result.ok) {
        addToHistory(expression);
      }
    },
    [inputJson, setJsonPathExpression, filterJsonPath, addToHistory],
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
