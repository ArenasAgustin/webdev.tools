import { useState, useEffect } from "react";
import { useModalState } from "@/hooks/useModalState";
import { useToast } from "@/hooks/useToast";
import { usePlaygroundInputLifecycle } from "@/hooks/usePlaygroundInputLifecycle";
import { useMergedConfigState } from "@/hooks/useMergedConfigState";
import { usePlaygroundShortcuts } from "@/hooks/usePlaygroundShortcuts";
import { useToolbarConfig } from "@/hooks/useToolbarConfig";
import { MAX_INPUT_LABEL } from "@/utils/constants/limits";
import type { PlaygroundConfig } from "@/types/playground";

export interface PlaygroundSetupConfig<TFormat extends object, TMinify extends object> {
  playgroundConfig: PlaygroundConfig;
  loadToolsConfig: () => { format?: Partial<TFormat>; minify?: Partial<TMinify> } | null;
  loadLastInput: () => string | null;
  saveLastInput: (value: string) => void;
  defaultFormatConfig: TFormat;
  defaultMinifyConfig: TMinify;
  preload: () => void;
}

const INPUT_TOO_LARGE_MESSAGE = `El contenido supera ${MAX_INPUT_LABEL}. Reduce el tamano para procesarlo.`;

export function usePlaygroundSetup<TFormat extends object, TMinify extends object>({
  playgroundConfig,
  loadToolsConfig,
  loadLastInput,
  saveLastInput,
  defaultFormatConfig,
  defaultMinifyConfig,
  preload,
}: PlaygroundSetupConfig<TFormat, TMinify>) {
  const [savedConfig] = useState(loadToolsConfig);
  const [input, setInput] = useState(() => {
    const saved = loadLastInput();
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- empty string must fall through to example
    return saved || playgroundConfig.example;
  });
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [formatConfig, setFormatConfig] = useMergedConfigState<TFormat>(
    defaultFormatConfig,
    savedConfig?.format,
  );
  const [minifyConfig, setMinifyConfig] = useMergedConfigState<TMinify>(
    defaultMinifyConfig,
    savedConfig?.minify,
  );

  const configModal = useModalState();
  const toast = useToast();

  const { debouncedInput, inputTooLarge, inputWarning } = usePlaygroundInputLifecycle({
    input,
    saveInput: saveLastInput,
    toast,
  });

  useEffect(() => {
    preload();
  }, [preload]);

  return {
    input,
    setInput,
    output,
    setOutput,
    error,
    setError,
    formatConfig,
    setFormatConfig,
    minifyConfig,
    setMinifyConfig,
    configModal,
    toast,
    debouncedInput,
    inputTooLarge,
    inputTooLargeMessage: INPUT_TOO_LARGE_MESSAGE,
    inputWarning,
  };
}

interface PlaygroundToolbarBase<M extends string, TFormat, TMinify> {
  handleFormat: () => void;
  handleMinify: () => void;
  handleCopyOutput: () => void;
  handleClearInput: () => void;
  handleExecute?: () => void;
  configModal: ReturnType<typeof useModalState>;
  mode: M;
  formatConfig: TFormat;
  setFormatConfig: (config: TFormat) => void;
  minifyConfig: TMinify;
  setMinifyConfig: (config: TMinify) => void;
  gridClassName?: string;
}

interface PlaygroundToolbarWithClean<
  M extends string,
  TFormat,
  TMinify,
  TClean,
> extends PlaygroundToolbarBase<M, TFormat, TMinify> {
  handleClean: () => void;
  cleanConfig: TClean;
  setCleanConfig: (config: TClean) => void;
}

// Overload: with clean config (JSON)
export function usePlaygroundToolbar<
  M extends string,
  TFormat extends object,
  TMinify extends object,
  TClean,
>(
  params: PlaygroundToolbarWithClean<M, TFormat, TMinify, TClean>,
): ReturnType<typeof useToolbarConfig<M, TFormat, TMinify, TClean>>;
// Overload: without clean config (CSS, HTML, JS)
export function usePlaygroundToolbar<
  M extends string,
  TFormat extends object,
  TMinify extends object,
>(
  params: PlaygroundToolbarBase<M, TFormat, TMinify>,
): ReturnType<typeof useToolbarConfig<M, TFormat, TMinify>>;
// Implementation
export function usePlaygroundToolbar<
  M extends string,
  TFormat extends object,
  TMinify extends object,
  TClean = undefined,
>({
  handleFormat,
  handleMinify,
  handleCopyOutput,
  handleClearInput,
  handleExecute,
  configModal,
  mode,
  formatConfig,
  setFormatConfig,
  minifyConfig,
  setMinifyConfig,
  gridClassName,
  ...cleanParams
}: PlaygroundToolbarBase<M, TFormat, TMinify> &
  Partial<
    Omit<
      PlaygroundToolbarWithClean<M, TFormat, TMinify, TClean>,
      keyof PlaygroundToolbarBase<M, TFormat, TMinify>
    >
  >) {
  const handleClean = (cleanParams as { handleClean?: () => void }).handleClean;

  usePlaygroundShortcuts({
    onFormat: handleFormat,
    onMinify: handleMinify,
    onClean: handleClean,
    onCopyOutput: handleCopyOutput,
    onClearInput: handleClearInput,
    onOpenConfig: configModal.open,
  });

  const toolbarParams = {
    mode,
    handleFormat,
    handleMinify,
    handleExecute,
    formatConfig,
    setFormatConfig,
    minifyConfig,
    setMinifyConfig,
    modal: configModal,
    gridClassName,
    ...(handleClean
      ? {
          handleClean,
          cleanConfig: (cleanParams as { cleanConfig: TClean }).cleanConfig,
          setCleanConfig: (cleanParams as { setCleanConfig: (c: TClean) => void }).setCleanConfig,
        }
      : {}),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
  return useToolbarConfig(toolbarParams as any);
}
