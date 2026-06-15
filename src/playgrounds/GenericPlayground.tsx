import { useState, useCallback, useMemo, useEffect, type ComponentProps } from "react";
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

import type { PlaygroundMode, PlaygroundActions } from "./engines/types";

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
 * Type guard: narrows an engine to one that carries a clean config.
 * Lets the compiler verify the clean-config access instead of relying on
 * non-null assertions or `as` casts.
 */
function hasCleanConfigEngine(engine: PlaygroundEngine): engine is PlaygroundEngineWithClean {
  return engine.features.includes("clean") && engine.cleanConfig !== undefined;
}

/** Stable no-op used only as a compiler-satisfying fallback; never runs at runtime. */
const noop = (): void => {
  /* intentionally empty */
};

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
  // Check features
  const hasExecute = engine.features.includes("execute");
  const hasMinify = engine.features.includes("minify");

  // Handle clean config — the type guard narrows the engine so the clean
  // config is accessed without non-null assertions or `as` casts.
  const cleanEngine = hasCleanConfigEngine(engine) ? engine : null;
  const [savedCleanConfig] = useState(() => cleanEngine?.loadToolsConfig()?.clean ?? undefined);
  const defaultCleanConfig = cleanEngine?.cleanConfig ?? {};

  const [cleanConfig, setCleanConfig] = useMergedConfigState(defaultCleanConfig, savedCleanConfig);
  const effectiveCleanConfig = cleanEngine ? cleanConfig : undefined;

  const overlays = usePlaygroundOverlays({
    onCloseExtra: () => {
      // No-op: extra panel not used in this playground
    },
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

  // Track whether the current output came from executing code rather than a
  // size transformation. Execution output hides the size comparison percentage.
  const [outputFromExecution, setOutputFromExecution] = useState(false);

  // A fresh input edit makes the comparison relevant again for the next action.
  // Reset during render when input changes (React's "adjust state on prop change"
  // pattern) instead of an effect, avoiding a cascading re-render.
  const [prevInput, setPrevInput] = useState(ctx.input);
  useEffect(() => {
    if (ctx.input !== prevInput) {
      setPrevInput(ctx.input);
      setOutputFromExecution(false);
    }
  }, [ctx.input, prevInput]);

  const trackOutput = useCallback(
    (handler: (() => void) | undefined, fromExecution: boolean) =>
      handler
        ? () => {
            setOutputFromExecution(fromExecution);
            handler();
          }
        : undefined,
    [],
  );

  const trackedExecute = useMemo(
    () => trackOutput(actions.handleExecute, true),
    [trackOutput, actions.handleExecute],
  );
  const trackedFormat = useMemo(
    () => trackOutput(actions.handleFormat, false) ?? actions.handleFormat,
    [trackOutput, actions.handleFormat],
  );
  const trackedMinify = useMemo(
    () => trackOutput(actions.handleMinify, false),
    [trackOutput, actions.handleMinify],
  );
  const trackedClean = useMemo(
    () => trackOutput(actions.handleClean, false),
    [trackOutput, actions.handleClean],
  );

  // Detect if JSON is minified
  const isMinified = useMemo(() => {
    if (engine.id !== "json") return false;
    try {
      const formatted = JSON.stringify(JSON.parse(ctx.input), null, 2);
      return ctx.input.trim() !== formatted.trim();
    } catch {
      return false;
    }
  }, [ctx.input, engine.id]);

  // Build toolbar params based on features
  const toolbarParams = cleanEngine
    ? {
        handleFormat: trackedFormat,
        handleMinify: hasMinify ? trackedMinify : undefined,
        // Clean engines always expose handleClean; the no-op fallback only
        // satisfies the compiler and never runs at runtime.
        handleClean: trackedClean ?? noop,
        handleExecute: trackedExecute,
        handleCopyOutput: actions.handleCopyOutput,
        handleClearInput: actions.handleClearInput,
        configModal: ctx.configModal,
        mode: engine.id as PlaygroundMode,
        formatConfig: ctx.formatConfig,
        setFormatConfig: ctx.setFormatConfig,
        minifyConfig: ctx.minifyConfig,
        setMinifyConfig: ctx.setMinifyConfig,
        cleanConfig,
        setCleanConfig: setCleanConfig as (config: unknown) => void,
        gridClassName: "grid grid-cols-2 sm:grid-cols-4 gap-2",
        isProcessing: actions.isProcessing,
        onOpenShortcuts: overlays.shortcuts.open,
        onOpenDiff: overlays.diff.open,
      }
    : {
        handleFormat: trackedFormat,
        handleMinify: hasMinify ? trackedMinify : undefined,
        handleExecute: hasExecute ? trackedExecute : undefined,
        handleCopyOutput: actions.handleCopyOutput,
        handleClearInput: actions.handleClearInput,
        configModal: ctx.configModal,
        mode: engine.id as PlaygroundMode,
        formatConfig: ctx.formatConfig,
        setFormatConfig: ctx.setFormatConfig,
        minifyConfig: ctx.minifyConfig,
        setMinifyConfig: ctx.setMinifyConfig,
        gridClassName: "grid grid-cols-2 sm:grid-cols-4 gap-2",
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
            outputIcon={engine.config.icon}
            extraOutputActions={outputActions}
            outputPanel={outputPanelRender}
            outputFromExecution={outputFromExecution}
          />
        }
        toolbar={
          <Toolbar
            variant="generic"
            tools={toolbarTools}
            config={engine.hasConfigModal ? (toolbarConfig as ComponentProps<typeof Toolbar>["config"]) : undefined}
            shortcuts={overlays.shortcuts}
            extraContent={toolbarExtraContent}
            isMinified={isMinified}
          />
        }
      />
      {modals}
    </>
  );
}
