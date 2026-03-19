import { useState, useMemo, useCallback } from "react";
import { Toolbar } from "@/components/layout/Toolbar";
import { PlaygroundLayout } from "@/components/layout/PlaygroundLayout";
import { Button } from "@/components/common/Button";
import { TipsModal } from "@/components/common/TipsModal";
import { JsonPathHistoryModal } from "@/components/common/JsonPathHistoryModal";
import { GenericEditors } from "@/components/editor/GenericEditors";
import { jsonPathTips, jsonPathQuickExamples } from "./jsonPathTips";
import { useJsonParser } from "@/hooks/useJsonParser";
import { useJsonPathHistory } from "@/hooks/useJsonPathHistory";
import { useJsonPlaygroundActions } from "@/hooks/useJsonPlaygroundActions";
import { useMergedConfigState } from "@/hooks/useMergedConfigState";
import { usePlaygroundSetup, usePlaygroundToolbar } from "@/hooks/usePlaygroundSetup";
import type { JsonFormatConfig, JsonMinifyConfig, JsonCleanConfig } from "@/types/json";
import {
  DEFAULT_JSON_FORMAT_CONFIG,
  DEFAULT_JSON_MINIFY_CONFIG,
  DEFAULT_JSON_CLEAN_CONFIG,
} from "@/types/json";
import { loadJsonToolsConfig, loadLastJson, saveLastJson } from "@/services/storage";
import { jsonPlaygroundConfig } from "./json.config";

const savedCleanConfig = loadJsonToolsConfig()?.clean;

const preload = () => {
  void import("@/services/formatter/prettier");
  void import("@/services/json/transform");
  void import("@/services/json/workerClient");
};

/**
 * JSON Playground - Encapsulated JSON tools
 * Handles formatting, minification, validation and JSONPath filtering
 */
export function JsonPlayground() {
  // JSON-specific state
  const [jsonPathExpression, setJsonPathExpression] = useState("");
  const [cleanConfig, setCleanConfig] = useMergedConfigState<JsonCleanConfig>(
    DEFAULT_JSON_CLEAN_CONFIG,
    savedCleanConfig,
  );
  const jsonPathHistory = useJsonPathHistory();

  const ctx = usePlaygroundSetup<JsonFormatConfig, JsonMinifyConfig>({
    playgroundConfig: jsonPlaygroundConfig,
    loadToolsConfig: loadJsonToolsConfig,
    loadLastInput: loadLastJson,
    saveLastInput: saveLastJson,
    defaultFormatConfig: DEFAULT_JSON_FORMAT_CONFIG,
    defaultMinifyConfig: DEFAULT_JSON_MINIFY_CONFIG,
    preload,
  });

  const validation = useJsonParser(ctx.debouncedInput);

  const actions = useJsonPlaygroundActions({
    inputJson: ctx.input,
    setInputJson: ctx.setInput,
    output: ctx.output,
    setOutput: ctx.setOutput,
    setError: ctx.setError,
    jsonPathExpression,
    setJsonPathExpression,
    addToHistory: jsonPathHistory.addToHistory,
    formatConfig: ctx.formatConfig,
    minifyConfig: ctx.minifyConfig,
    cleanConfig,
    toast: ctx.toast,
    inputTooLarge: ctx.inputTooLarge,
    inputTooLargeMessage: ctx.inputTooLargeMessage,
  });

  const { toolbarTools, toolbarConfig } = usePlaygroundToolbar({
    handleFormat: actions.handleFormat,
    handleMinify: actions.handleMinify,
    handleClean: actions.handleClean,
    handleCopyOutput: actions.handleCopyOutput,
    handleClearInput: actions.handleClearInput,
    configModal: ctx.configModal,
    mode: "json" as const,
    formatConfig: ctx.formatConfig,
    setFormatConfig: ctx.setFormatConfig,
    minifyConfig: ctx.minifyConfig,
    setMinifyConfig: ctx.setMinifyConfig,
    cleanConfig,
    setCleanConfig,
    gridClassName: "grid grid-cols-2 sm:grid-cols-3 gap-2",
  });

  // Modal state for tips/history (managed locally, not in Toolbar)
  const [jsonPathModal, setJsonPathModal] = useState<"tips" | "history" | null>(null);

  const handleShowTips = useCallback(() => setJsonPathModal("tips"), []);
  const handleShowHistory = useCallback(() => setJsonPathModal("history"), []);
  const handleCloseJsonPathModal = useCallback(() => setJsonPathModal(null), []);

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
            onClick={actions.handleApplyJsonPath}
            aria-label="Aplicar filtro JSONPath"
            title="Aplicar filtro JSONPath"
          >
            <i className="fas fa-search" aria-hidden="true"></i>
          </Button>
        </div>
      </div>
    ),
    [
      jsonPathExpression,
      setJsonPathExpression,
      actions.handleApplyJsonPath,
      handleShowHistory,
      handleShowTips,
    ],
  );

  return (
    <>
      <PlaygroundLayout
        editors={
          <GenericEditors
            input={ctx.input}
            output={ctx.output}
            error={ctx.error}
            validationState={validation}
            inputWarning={ctx.inputWarning}
            language="json"
            inputTitle="JSON"
            inputPlaceholder="Pega tu JSON aquí..."
            waitingLabel="Esperando JSON..."
            validLabel="JSON válido"
            invalidLabel="JSON inválido"
            onInputChange={ctx.setInput}
            onClearInput={actions.handleClearInput}
            onLoadExample={actions.handleLoadExample}
            onCopyOutput={actions.handleCopyOutput}
            onDownloadInput={actions.handleDownloadInput}
            onDownloadOutput={actions.handleDownloadOutput}
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
          actions.handleReuseFromHistory(expression);
          setJsonPathModal(null);
        }}
        onDelete={jsonPathHistory.removeFromHistory}
        onClearAll={jsonPathHistory.clearHistory}
      />
    </>
  );
}
