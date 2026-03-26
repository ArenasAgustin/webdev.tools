import { useCallback } from "react";
import { usePlaygroundActions, type ToastApi } from "./usePlaygroundActions";
import { useTransformActions } from "./useTransformActions";
import { createTransformHandler } from "@/utils/createTransformHandler";

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
    validateInput: useCallback(
      () =>
        inputTooLarge
          ? (inputTooLargeMessage ?? "El contenido es demasiado grande para procesarlo.")
          : null,
      [inputTooLarge, inputTooLargeMessage],
    ),
  });

  const { runTransformAction, isProcessing, setIsProcessing } = useTransformActions({
    createInputValidator: baseActions.createInputValidator,
    toast,
  });

  const handleUseOutputAsInput = useCallback(() => {
    if (!output) {
      toast?.error("No hay resultado para usar como entrada");
      return;
    }
    setInput(output);
    toast?.success("Resultado cargado como entrada");
  }, [output, setInput, toast]);

  const handleUseInputAsOutput = useCallback(() => {
    if (!input) {
      toast?.error("No hay entrada para usar como resultado");
      return;
    }
    setOutput(input);
    setError(null);
    toast?.success("Entrada cargada como resultado");
  }, [input, setOutput, setError, toast]);

  const handleImportFile = useCallback(
    (file: File) => {
      const ext = file.name.includes(".")
        ? `.${file.name.split(".").pop()!.toLowerCase()}`
        : "";
      const allowed = acceptExtensions
        .split(",")
        .map((e) => e.trim().toLowerCase());

      if (!allowed.includes(ext)) {
        toast?.error(
          `Archivo no válido. Extensiones aceptadas: ${acceptExtensions}`,
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setInput(reader.result as string);
        toast?.success(`Archivo "${file.name}" cargado`);
      };
      reader.onerror = () => {
        toast?.error("Error al leer el archivo");
      };
      reader.readAsText(file);
    },
    [acceptExtensions, setInput, toast],
  );

  const handleCopyOutput = useCallback(() => {
    baseActions.handleCopy({
      text: output,
      successMessage: "Resultado copiado al portapapeles",
      validate: () => (!output ? "No hay resultado para copiar" : null),
    });
  }, [baseActions, output]);

  const handleDownloadInput = useCallback(() => {
    baseActions.handleDownload({
      content: input,
      fileName: inputFileName,
      mimeType,
      successMessage: `Descargado como ${inputFileName}`,
      validate: () => (!input ? `No hay ${language} para descargar` : null),
    });
  }, [baseActions, input, inputFileName, mimeType, language]);

  const handleDownloadOutput = useCallback(() => {
    baseActions.handleDownload({
      content: output,
      fileName: outputFileName,
      mimeType,
      successMessage: `Descargado como ${outputFileName}`,
      validate: () => (!output ? "No hay resultado para descargar" : null),
    });
  }, [baseActions, output, outputFileName, mimeType]);

  const handleFormat = useCallback(() => {
    createTransformHandler({
      runTransformAction,
      run: () => formatRunner(input, formatConfig),
      setOutput,
      setError,
      autoCopy: formatConfig.autoCopy,
      successMessage: `${language} formateado correctamente`,
      errorMessage: `Error al formatear ${language}`,
    });
  }, [runTransformAction, input, formatConfig, setError, setOutput, formatRunner, language]);

  const handleMinify = useCallback(() => {
    createTransformHandler({
      runTransformAction,
      run: () => minifyRunner(input, minifyConfig),
      setOutput,
      setError,
      autoCopy: minifyConfig.autoCopy,
      successMessage: `${language} minificado correctamente`,
      errorMessage: `Error al minificar ${language}`,
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
