import { useState, useCallback } from "react";
import type { ReactNode } from "react";
import { Toolbar } from "@/components/layout/Toolbar";
import { PlaygroundLayout } from "@/components/layout/PlaygroundLayout";
import { GenericEditors } from "@/components/editor/GenericEditors";
import { usePlaygroundOverlays } from "@/hooks/usePlaygroundOverlays";
import { useMergedConfigState } from "@/hooks/useMergedConfigState";
import { usePlaygroundSetup, usePlaygroundToolbar } from "@/hooks/usePlaygroundSetup";
import type {
  PlaygroundEngine,
  PlaygroundEngineWithClean,
  OutputPanelProps,
} from "./engines/types";

type PlaygroundMode = "json" | "js" | "html" | "css";

import type { PlaygroundActions } from "./engines/types";

interface GenericPlaygroundExtraProps {
  /** Extra params for actions (jsonPathExpression, etc.) */
  extraActionsParams?: object;
  /** Extra toolbar content - receives actions for direct access */
  renderToolbarExtra?: (params: { actions: PlaygroundActions }) => ReactNode;
  /** Extra output actions */
  renderOutputActions?: () => ReactNode;
  /** Extra output panel */
  renderOutputPanel?: (props: OutputPanelProps) => ReactNode;
  /** Extra modals */
  renderModals?: () => ReactNode[];
}

interface GenericPlaygroundProps extends GenericPlaygroundExtraProps {
  engine: PlaygroundEngine;
}

/**
 * Generic Playground - A unified component that renders any playground engine
 * All UI and state is defined in the engine configuration
 */
export function GenericPlayground({
  engine,
  extraActionsParams,
  renderToolbarExtra,
  renderOutputActions,
  renderOutputPanel,
  renderModals,
}: GenericPlaygroundProps) {
  const [, setJsonPathModal] = useState<"tips" | "history" | null>(null);

  // Check features
  const hasClean = engine.features.includes("clean");
  const hasExecute = engine.features.includes("execute");

  // Handle clean config
  const hasCleanConfig =
    hasClean &&
    "cleanConfig" in engine &&
    (engine as PlaygroundEngineWithClean).cleanConfig !== undefined;
  const engineWithClean = engine as PlaygroundEngineWithClean;
  const savedCleanConfig = hasCleanConfig ? engineWithClean.loadToolsConfig()?.clean : undefined;
  const defaultCleanConfig =
    hasCleanConfig && engineWithClean.cleanConfig ? engineWithClean.cleanConfig : {};

  const [cleanConfig, setCleanConfig] = useMergedConfigState(defaultCleanConfig, savedCleanConfig);
  const effectiveCleanConfig = hasCleanConfig ? cleanConfig : undefined;

  const overlays = usePlaygroundOverlays({
    onCloseExtra: useCallback(() => setJsonPathModal(null), []),
  });

  const ctx = usePlaygroundSetup({
    playgroundConfig: engine.config,
    loadToolsConfig: engine.loadToolsConfig,
    loadLastInput: engine.loadLastInput,
    saveLastInput: engine.saveLastInput,
    defaultFormatConfig: engine.defaultFormatConfig,
    defaultMinifyConfig: engine.defaultMinifyConfig,
    preload: engine.preload,
    configModal: overlays.config,
  });

  const validation = engine.useParser(ctx.debouncedInput);

  // Build actions params based on engine
  const baseActionsParams = {
    input: ctx.input,
    setInput: ctx.setInput,
    output: ctx.output,
    setOutput: ctx.setOutput,
    setError: ctx.setError,
    formatConfig: ctx.formatConfig,
    minifyConfig: ctx.minifyConfig,
    inputTooLarge: ctx.inputTooLarge,
    inputTooLargeMessage: ctx.inputTooLargeMessage,
    toast: ctx.toast,
    ...(effectiveCleanConfig ? { cleanConfig: effectiveCleanConfig } : {}),
    ...extraActionsParams,
  };

  const mappedParams = engine.mapActionsParams(baseActionsParams);
  const actions = engine.useActions(mappedParams);

  // Build toolbar params based on features
  const toolbarParams = hasCleanConfig
    ? {
        handleFormat: actions.handleFormat,
        handleMinify: actions.handleMinify,
        handleClean: actions.handleClean!,
        handleExecute: actions.handleExecute,
        handleCopyOutput: actions.handleCopyOutput,
        handleClearInput: actions.handleClearInput,
        configModal: ctx.configModal,
        mode: engine.id as PlaygroundMode,
        formatConfig: ctx.formatConfig,
        setFormatConfig: ctx.setFormatConfig,
        minifyConfig: ctx.minifyConfig,
        setMinifyConfig: ctx.setMinifyConfig,
        cleanConfig: effectiveCleanConfig!,
        setCleanConfig: setCleanConfig as (config: unknown) => void,
        gridClassName: "grid grid-cols-2 sm:grid-cols-3 gap-2",
        isProcessing: actions.isProcessing,
        onOpenShortcuts: overlays.shortcuts.open,
        onOpenDiff: overlays.diff.open,
      }
    : {
        handleFormat: actions.handleFormat,
        handleMinify: actions.handleMinify,
        handleExecute: hasExecute ? actions.handleExecute : undefined,
        handleCopyOutput: actions.handleCopyOutput,
        handleClearInput: actions.handleClearInput,
        configModal: ctx.configModal,
        mode: engine.id as PlaygroundMode,
        formatConfig: ctx.formatConfig,
        setFormatConfig: ctx.setFormatConfig,
        minifyConfig: ctx.minifyConfig,
        setMinifyConfig: ctx.setMinifyConfig,
        gridClassName: "grid grid-cols-2 sm:grid-cols-3 gap-2",
        isProcessing: actions.isProcessing,
        onOpenShortcuts: overlays.shortcuts.open,
        onOpenDiff: overlays.diff.open,
      };

  const { toolbarTools, toolbarConfig } = usePlaygroundToolbar(toolbarParams);

  // Use engine's render functions or props
  const extraParams = { input: ctx.input, output: ctx.output, actions, overlays };
  const toolbarExtraContent =
    renderToolbarExtra?.({ actions }) ?? engine.renderToolbarExtra?.(extraParams);
  const outputActions = renderOutputActions?.() ?? engine.renderOutputActions?.(extraParams);
  const outputPanelFn = renderOutputPanel ?? engine.renderOutputPanel;
  const modals = renderModals?.() ?? engine.renderModals?.(extraParams) ?? [];

  // Build output panel props if engine provides custom panel
  const outputPanelRender = outputPanelFn
    ? (props: OutputPanelProps) => outputPanelFn({ ...extraParams, ...props })
    : undefined;

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
            language={engine.editorLanguage}
            inputTitle={engine.fileConfig.language}
            inputPlaceholder={`Escribe tu ${engine.fileConfig.language} aquí...`}
            waitingLabel={`Esperando ${engine.fileConfig.language}...`}
            validLabel={`${engine.fileConfig.language} válido`}
            invalidLabel={`${engine.fileConfig.language} inválido`}
            onInputChange={ctx.setInput}
            onClearInput={actions.handleClearInput}
            onLoadExample={actions.handleLoadExample}
            onCopyOutput={actions.handleCopyOutput}
            onDownloadInput={actions.handleDownloadInput}
            onDownloadOutput={actions.handleDownloadOutput}
            isProcessing={actions.isProcessing}
            onUseOutputAsInput={actions.handleUseOutputAsInput}
            onUseInputAsOutput={actions.handleUseInputAsOutput}
            diffModal={overlays.diff}
            editorState={overlays.editor}
            onImportFile={actions.handleImportFile}
            acceptExtensions={actions.acceptExtensions}
            extraOutputActions={outputActions}
            outputPanel={outputPanelRender}
          />
        }
        toolbar={
          <Toolbar
            variant="generic"
            tools={toolbarTools}
            config={toolbarConfig as never}
            shortcuts={overlays.shortcuts}
            extraContent={toolbarExtraContent}
          />
        }
      />
      {modals}
    </>
  );
}
