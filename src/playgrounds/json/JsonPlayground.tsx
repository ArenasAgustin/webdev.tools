import { useState, useEffect, useMemo, useCallback } from "react";
import { Toolbar } from "@/components/layout/Toolbar";
import { PlaygroundLayout } from "@/components/layout/PlaygroundLayout";
import { Button } from "@/components/common/Button";
import { TipsModal } from "@/components/common/TipsModal";
import { JsonPathHistoryModal } from "@/components/common/JsonPathHistoryModal";
import { JsonEditors } from "./JsonEditors";
import { jsonPathTips, jsonPathQuickExamples } from "./jsonPathTips";
import { useJsonParser } from "@/hooks/useJsonParser";
import { useJsonPathHistory } from "@/hooks/useJsonPathHistory";
import { usePlaygroundShortcuts } from "@/hooks/usePlaygroundShortcuts";
import { useJsonPlaygroundActions } from "@/hooks/useJsonPlaygroundActions";
import { usePlaygroundInputLifecycle } from "@/hooks/usePlaygroundInputLifecycle";
import { useMergedConfigState } from "@/hooks/useMergedConfigState";
import { useToast } from "@/hooks/useToast";
import { useModalState } from "@/hooks/useModalState";
import { MAX_INPUT_LABEL } from "@/utils/constants/limits";
import type { JsonFormatConfig, JsonMinifyConfig, JsonCleanConfig } from "@/types/json";
import type { ToolbarConfig } from "@/types/toolbar";
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
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [jsonPathExpression, setJsonPathExpression] = useState("");
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
  const jsonPathHistory = useJsonPathHistory();

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
    output,
    setOutput,
    setError,
    // JSONPath
    jsonPathExpression,
    setJsonPathExpression,
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

  // Modal state for tips/history (managed locally, not in Toolbar)
  const [jsonPathModal, setJsonPathModal] = useState<"tips" | "history" | null>(null);

  const handleShowTips = useCallback(() => setJsonPathModal("tips"), []);
  const handleShowHistory = useCallback(() => setJsonPathModal("history"), []);
  const handleCloseJsonPathModal = useCallback(() => setJsonPathModal(null), []);

  // Memoize toolbar tools (single memo like CSS/HTML/JS)
  const toolbarTools = useMemo<ToolbarConfig>(
    () => ({
      actions: [
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
          label: "Limpiar vacíos",
          icon: "broom",
          variant: "orange",
          onClick: handleClean,
        },
      ],
      configButtonTitle: "Configurar herramientas",
      gridClassName: "grid grid-cols-2 sm:grid-cols-3 gap-2",
    }),
    [handleFormat, handleMinify, handleClean],
  );

  const toolbarConfig = useMemo(
    () => ({
      mode: "json" as const,
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

  // JSONPath extra content for Toolbar
  const jsonPathSection = useMemo(
    () => (
      <div>
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <i className="fas fa-filter text-cyan-400"></i> Filtro JSONPath
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={handleShowHistory}
              className="text-gray-300 hover:text-cyan-300 transition-colors"
              title="Historial de filtros"
              aria-label="Historial de filtros"
            >
              <i className="fas fa-history" aria-hidden="true"></i>
            </button>
            <button
              type="button"
              onClick={handleShowTips}
              className="text-gray-300 hover:text-cyan-300 transition-colors"
              title="Ver tips de filtros"
              aria-label="Ver tips de filtros"
            >
              <i className="fas fa-question-circle" aria-hidden="true"></i>
            </button>
          </div>
        </h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={jsonPathExpression}
            onChange={(e) => setJsonPathExpression(e.target.value)}
            aria-label="Expresion JSONPath"
            className="flex-1 px-3 py-2 bg-gray-900/50 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-400 text-xs border border-white/10"
            placeholder="Ej: $.users[0].name"
          />
          <Button
            variant="cyan"
            size="md"
            onClick={handleApplyJsonPath}
            aria-label="Aplicar filtro JSONPath"
            title="Aplicar filtro JSONPath"
          >
            <i className="fas fa-search" aria-hidden="true"></i>
          </Button>
        </div>
      </div>
    ),
    [jsonPathExpression, setJsonPathExpression, handleApplyJsonPath, handleShowHistory, handleShowTips],
  );

  return (
    <>
      <PlaygroundLayout
        editors={
          <JsonEditors
            inputJson={inputJson}
            output={output}
            error={error}
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
            variant="generic"
            tools={toolbarTools}
            config={toolbarConfig}
            extraContent={jsonPathSection}
          />
        }
      />

      {/* Tips Modal */}
      <TipsModal
        isOpen={jsonPathModal === "tips"}
        title="Tips para Filtros JSONPath"
        icon="lightbulb"
        iconColor="yellow-400"
        tips={jsonPathTips}
        quickExamples={jsonPathQuickExamples}
        onClose={handleCloseJsonPathModal}
        onTryExample={(code) => {
          setJsonPathExpression(code);
          setJsonPathModal(null);
        }}
      />

      {/* History Modal */}
      <JsonPathHistoryModal
        isOpen={jsonPathModal === "history"}
        history={jsonPathHistory.history}
        onClose={handleCloseJsonPathModal}
        onReuse={(expression) => {
          handleReuseFromHistory(expression);
          setJsonPathModal(null);
        }}
        onDelete={jsonPathHistory.removeFromHistory}
        onClearAll={jsonPathHistory.clearHistory}
      />
    </>
  );
}
