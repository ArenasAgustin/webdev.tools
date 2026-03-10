import { useState, useEffect, useMemo } from "react";
import { Toolbar } from "@/components/layout/Toolbar";
import { PlaygroundLayout } from "@/components/layout/PlaygroundLayout";
import { JsonEditors } from "./JsonEditors";
import { jsonPathTips, jsonPathQuickExamples } from "./jsonPathTips";
import { useJsonParser } from "@/hooks/useJsonParser";
import { useJsonFormatter } from "@/hooks/useJsonFormatter";
import { useJsonPath } from "@/hooks/useJsonPath";
import { useJsonPathHistory } from "@/hooks/useJsonPathHistory";
import { usePlaygroundShortcuts } from "@/hooks/usePlaygroundShortcuts";
import { useJsonPlaygroundActions } from "@/hooks/useJsonPlaygroundActions";
import { usePlaygroundInputLifecycle } from "@/hooks/usePlaygroundInputLifecycle";
import { useMergedConfigState } from "@/hooks/useMergedConfigState";
import { useToast } from "@/hooks/useToast";
import { useModalState } from "@/hooks/useModalState";
import { MAX_INPUT_LABEL } from "@/utils/constants/limits";
import type { JsonFormatConfig, JsonMinifyConfig, JsonCleanConfig } from "@/types/json";
import { DEFAULT_JSON_FORMAT_CONFIG, DEFAULT_JSON_MINIFY_CONFIG, DEFAULT_JSON_CLEAN_CONFIG } from "@/types/json";
import { loadJsonToolsConfig, loadLastJson, saveLastJson } from "@/services/storage";
import { jsonPlaygroundConfig } from "./json.config";

const savedConfig = loadJsonToolsConfig();

/**
 * JSON Playground - Encapsulated JSON tools
 * Handles formatting, minification, validation and JSONPath filtering
 */
export function JsonPlayground() {
  const [inputJson, setInputJson] = useState<string>(() => loadLastJson() || jsonPlaygroundConfig.example);
  const [formatConfig, setFormatConfig] = useMergedConfigState<JsonFormatConfig>(
    DEFAULT_JSON_FORMAT_CONFIG,
    savedConfig?.format,
  );
  const [minifyConfig, setMinifyConfig] = useMergedConfigState<JsonMinifyConfig>(
    DEFAULT_JSON_MINIFY_CONFIG,
    savedConfig?.minify,
  );
  const [cleanConfig, setCleanConfig] = useMergedConfigState<JsonCleanConfig>(
    DEFAULT_JSON_CLEAN_CONFIG,
    savedConfig?.clean,
  );

  // Modal state management
  const configModal = useModalState();
  const toast = useToast();

  const {
    debouncedInput: debouncedInputJson,
    inputTooLarge,
    inputWarning,
  } = usePlaygroundInputLifecycle({
    input: inputJson,
    saveInput: saveLastJson,
    toast,
  });

  useEffect(() => {
    void import("@/services/formatter/prettier");
    void import("@/services/json/transform");
  }, []);

  // Use custom hooks for logic encapsulation
  const validation = useJsonParser(debouncedInputJson);
  const formatter = useJsonFormatter();
  const jsonPath = useJsonPath();
  const jsonPathHistory = useJsonPathHistory();

  // Determine which output to show (formatter or jsonPath)
  // jsonPath.output starts as "", so nullish-coalescing would always prefer it.
  const hasJsonPathResult = jsonPath.output !== "" || jsonPath.error !== null;
  const outputJson = hasJsonPathResult ? jsonPath.output : formatter.output;
  const outputError = hasJsonPathResult ? jsonPath.error : formatter.error;

  // Encapsulate all handlers
  const {
    handleClearInput,
    handleLoadExample,
    handleCopyOutput,
    handleDownloadInput,
    handleDownloadOutput,
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
    inputTooLarge,
    inputTooLargeMessage: `El contenido supera ${MAX_INPUT_LABEL}. Reduce el tamano para procesarlo.`,
  });

  usePlaygroundShortcuts({
    onFormat: handleFormat,
    onMinify: handleMinify,
    onClean: handleClean,
    onCopyOutput: handleCopyOutput,
    onClearInput: handleClearInput,
    onOpenConfig: configModal.open,
  });

  // Memoize complex objects to prevent Toolbar re-renders
  const toolbarActions = useMemo(
    () => ({
      onFormat: handleFormat,
      onMinify: handleMinify,
      onClean: handleClean,
      onFilter: handleApplyJsonPath,
    }),
    [handleFormat, handleMinify, handleClean, handleApplyJsonPath],
  );

  const toolbarJsonPath = useMemo(
    () => ({
      value: jsonPath.expression,
      onChange: jsonPath.setExpression,
    }),
    [jsonPath.expression, jsonPath.setExpression],
  );

  const toolbarHistory = useMemo(
    () => ({
      items: jsonPathHistory.history,
      onReuse: handleReuseFromHistory,
      onDelete: jsonPathHistory.removeFromHistory,
      onClear: jsonPathHistory.clearHistory,
    }),
    [
      jsonPathHistory.history,
      handleReuseFromHistory,
      jsonPathHistory.removeFromHistory,
      jsonPathHistory.clearHistory,
    ],
  );

  const toolbarConfig = useMemo(
    () => ({
      format: formatConfig,
      onFormatChange: setFormatConfig,
      minify: minifyConfig,
      onMinifyChange: setMinifyConfig,
      clean: cleanConfig,
      onCleanChange: setCleanConfig,
      isOpen: configModal.isOpen,
      onOpenChange: configModal.setIsOpen,
    }),
    [
      formatConfig,
      minifyConfig,
      cleanConfig,
      configModal.isOpen,
      configModal.setIsOpen,
      setFormatConfig,
      setMinifyConfig,
      setCleanConfig,
    ],
  );

  const toolbarTips = useMemo(
    () => ({
      config: {
        tips: jsonPathTips,
        quickExamples: jsonPathQuickExamples,
      },
    }),
    [],
  );

  return (
    <PlaygroundLayout
      editors={
        <JsonEditors
          inputJson={inputJson}
          output={outputJson}
          error={outputError}
          validationState={validation}
          inputWarning={inputWarning}
          onInputChange={setInputJson}
          onClearInput={handleClearInput}
          onLoadExample={handleLoadExample}
          onCopyOutput={handleCopyOutput}
          onDownloadInput={handleDownloadInput}
          onDownloadOutput={handleDownloadOutput}
        />
      }
      toolbar={
        <Toolbar
          variant="json"
          actions={toolbarActions}
          jsonPath={toolbarJsonPath}
          history={toolbarHistory}
          config={toolbarConfig}
          tips={toolbarTips}
        />
      }
    />
  );
}
