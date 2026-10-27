import { useCallback } from "react";
import { usePlaygroundActions, type ToastApi } from "./usePlaygroundActions";
import { useTransformActions } from "./useTransformActions";
import { createTransformHandler } from "@/utils/createTransformHandler";
import { translate } from "@/i18n/translate";

export interface PlaygroundFileConfig {
  /** Input file name for download (e.g. "styles.css") */
  inputFileName: string;
  /** Output file name for download (e.g. "result.css") */
  outputFileName: string;
  /** MIME type for downloads (e.g. "text/css") */
  mimeType: string;
  /** Language label for messages (e.g. "CSS") */
  language: string;
  /** Comma-separated accepted extensions for file import, e.g. ".json" or ".js,.ts,.mjs" */
  acceptExtensions: string;
}

export interface UseGenericPlaygroundActionsProps<TFormat, TMinify> {
  input: string;
  setInput: (value: string) => void;
  output: string;
  setOutput: (value: string) => void;
  setError: (error: string | null) => void;
  inputTooLarge?: boolean;
  inputTooLargeMessage?: string;
  formatConfig: TFormat & { autoCopy?: boolean };
  minifyConfig: TMinify & { autoCopy?: boolean };
  toast?: ToastApi;
  exampleContent: string;
  fileConfig: PlaygroundFileConfig;
  formatRunner: (input: string, config: TFormat) => Promise<string>;
  minifyRunner: (input: string, config: TMinify) => Promise<string>;
}

export function useGenericPlaygroundActions<TFormat, TMinify>({
  input,
  setInput,
  output,
  setOutput,
  setError,
  inputTooLarge,
  inputTooLargeMessage,
  formatConfig,
  minifyConfig,
  toast,
  exampleContent,
  fileConfig,
  formatRunner,
  minifyRunner,
}: UseGenericPlaygroundActionsProps<TFormat, TMinify>) {
  const { language, inputFileName, outputFileName, mimeType, acceptExtensions } = fileConfig;

  const baseActions = usePlaygroundActions({
    input,
    setInput,
    exampleContent,
    toast,
    onClearOutputs: useCallback(() => {
      setOutput("");
      setError(null);
    }, [setOutput, setError]),
    // Shared by every transform (format, minify, clean, execute): an empty input must
    // fail instead of "succeeding" with an empty result.
    validateInput: useCallback(() => {
      if (!input.trim()) {
        return translate("messages.noInputToProcess", { language });
      }
      return inputTooLarge ? (inputTooLargeMessage ?? translate("messages.inputTooLarge")) : null;
    }, [input, language, inputTooLarge, inputTooLargeMessage]),
  });

  const { runTransformAction, isProcessing, setIsProcessing } = useTransformActions({
    createInputValidator: baseActions.createInputValidator,
    toast,
  });

  const handleUseOutputAsInput = useCallback(() => {
    if (!output) {
      toast?.error(translate("messages.noOutputToUseAsInput"));
      return;
    }
    setInput(output);
    toast?.success(translate("messages.outputLoadedAsInput"));
  }, [output, setInput, toast]);

  const handleUseInputAsOutput = useCallback(() => {
    if (!input) {
      toast?.error(translate("messages.noInputToUseAsOutput"));
      return;
    }
    setOutput(input);
    setError(null);
    toast?.success(translate("messages.inputLoadedAsOutput"));
  }, [input, setOutput, setError, toast]);

  const handleImportFile = useCallback(
    (file: File) => {
      const ext = file.name.includes(".") ? `.${file.name.split(".").pop()!.toLowerCase()}` : "";
      const allowed = acceptExtensions.split(",").map((e) => e.trim().toLowerCase());

      if (!allowed.includes(ext)) {
        toast?.error(translate("messages.invalidFile", { extensions: acceptExtensions }));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setInput(reader.result as string);
        toast?.success(translate("messages.fileLoaded", { name: file.name }));
      };
      reader.onerror = () => {
        toast?.error(translate("messages.fileReadError"));
      };
      reader.readAsText(file);
    },
    [acceptExtensions, setInput, toast],
  );

  const handleCopyOutput = useCallback(() => {
    baseActions.handleCopy({
      text: output,
      successMessage: translate("messages.outputCopied"),
      validate: () => (!output ? translate("messages.noOutputToCopy") : null),
    });
  }, [baseActions, output]);

  const handleDownloadInput = useCallback(() => {
    baseActions.handleDownload({
      content: input,
      fileName: inputFileName,
      mimeType,
      successMessage: translate("messages.downloadedAs", { fileName: inputFileName }),
      validate: () => (!input ? translate("messages.noInputToDownload", { language }) : null),
    });
  }, [baseActions, input, inputFileName, mimeType, language]);

  const handleDownloadOutput = useCallback(() => {
    baseActions.handleDownload({
      content: output,
      fileName: outputFileName,
      mimeType,
      successMessage: translate("messages.downloadedAs", { fileName: outputFileName }),
      validate: () => (!output ? translate("messages.noOutputToDownload") : null),
    });
  }, [baseActions, output, outputFileName, mimeType]);

  const handleFormat = useCallback(() => {
    createTransformHandler({
      runTransformAction,
      run: () => formatRunner(input, formatConfig),
      setOutput,
      setError,
      autoCopy: formatConfig.autoCopy,
      successMessage: translate("messages.formatted", { language }),
      errorMessage: translate("messages.formatError", { language }),
    });
  }, [runTransformAction, input, formatConfig, setError, setOutput, formatRunner, language]);

  const handleMinify = useCallback(() => {
    createTransformHandler({
      runTransformAction,
      run: () => minifyRunner(input, minifyConfig),
      setOutput,
      setError,
      autoCopy: minifyConfig.autoCopy,
      successMessage: translate("messages.minified", { language }),
      errorMessage: translate("messages.minifyError", { language }),
    });
  }, [runTransformAction, input, minifyConfig, setError, setOutput, minifyRunner, language]);

  return {
    handleClearInput: baseActions.handleClearInput,
    handleLoadExample: baseActions.handleLoadExample,
    handleImportFile,
    handleCopyOutput,
    handleDownloadInput,
    handleDownloadOutput,
    handleFormat,
    handleMinify,
    handleUseOutputAsInput,
    handleUseInputAsOutput,
    /** Accepted file extensions for import (e.g. ".json" or ".js,.ts") */
    acceptExtensions,
    /** True while a format/minify transform is in progress */
    isProcessing,
    /** Exposed for extended hooks that need to share the processing state */
    setIsProcessing,
    /** Exposed for extended hooks that need custom validated actions */
    baseActions,
    runTransformAction,
  };
}
