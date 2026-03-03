import { useCallback } from "react";
import { htmlPlaygroundConfig } from "@/playgrounds/html/html.config";
import { formatHtml, minifyHtml } from "@/services/html/transform";
import { usePlaygroundActions, type ToastApi } from "./usePlaygroundActions";
import { useTransformActions } from "./useTransformActions";
import type { HtmlFormatConfig, HtmlMinifyConfig } from "@/types/html";

interface UseHtmlPlaygroundActionsProps {
  inputHtml: string;
  setInputHtml: (value: string) => void;
  output: string;
  setOutput: (value: string) => void;
  setError: (error: string | null) => void;
  inputTooLarge?: boolean;
  inputTooLargeMessage?: string;
  formatConfig: HtmlFormatConfig;
  minifyConfig: HtmlMinifyConfig;
  toast?: ToastApi;
}

export function useHtmlPlaygroundActions({
  inputHtml,
  setInputHtml,
  output,
  setOutput,
  setError,
  inputTooLarge,
  inputTooLargeMessage,
  formatConfig,
  minifyConfig,
  toast,
}: UseHtmlPlaygroundActionsProps) {
  const baseActions = usePlaygroundActions({
    input: inputHtml,
    setInput: setInputHtml,
    exampleContent: htmlPlaygroundConfig.example,
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

  const { runTransformAction } = useTransformActions({
    createInputValidator: baseActions.createInputValidator,
    toast,
  });

  const handleCopyOutput = useCallback(() => {
    baseActions.handleCopy({
      text: output,
      successMessage: "Resultado copiado al portapapeles",
      validate: () => (!output ? "No hay resultado para copiar" : null),
    });
  }, [baseActions, output]);

  const handleDownloadInput = useCallback(() => {
    baseActions.handleDownload({
      content: inputHtml,
      fileName: "index.html",
      mimeType: "text/html",
      successMessage: "Descargado como index.html",
      validate: () => (!inputHtml ? "No hay HTML para descargar" : null),
    });
  }, [baseActions, inputHtml]);

  const handleDownloadOutput = useCallback(() => {
    baseActions.handleDownload({
      content: output,
      fileName: "result.html",
      mimeType: "text/html",
      successMessage: "Descargado como result.html",
      validate: () => (!output ? "No hay resultado para descargar" : null),
    });
  }, [baseActions, output]);

  const handleFormat = useCallback(() => {
    runTransformAction({
      run: async () => {
        const result = await formatHtml(inputHtml, formatConfig.indentSize);

        if (!result.ok) {
          throw new Error(result.error || "Error al formatear HTML");
        }

        return result.value;
      },
      onSuccess: (value) => {
        setError(null);
        setOutput(value);
        if (formatConfig.autoCopy && value) {
          navigator.clipboard.writeText(value).catch((err) => {
            console.error("Error al copiar al portapapeles: ", err);
          });
        }
      },
      onError: (message) => {
        setError(message);
      },
      successMessage: "HTML formateado correctamente",
      errorMessage: "Error al formatear HTML",
    });
  }, [runTransformAction, inputHtml, formatConfig, setError, setOutput]);

  const handleMinify = useCallback(() => {
    runTransformAction({
      run: () => {
        const result = minifyHtml(inputHtml, {
          removeComments: minifyConfig.removeComments,
          collapseWhitespace: minifyConfig.collapseWhitespace,
          minifyCss: minifyConfig.minifyCss,
          minifyJs: minifyConfig.minifyJs,
        });

        if (!result.ok) {
          throw new Error(result.error || "Error al minificar HTML");
        }

        return result.value;
      },
      onSuccess: (value) => {
        setError(null);
        setOutput(value);
        if (minifyConfig.autoCopy && value) {
          navigator.clipboard.writeText(value).catch((err) => {
            console.error("Error al copiar al portapapeles: ", err);
          });
        }
      },
      onError: (message) => {
        setError(message);
      },
      successMessage: "HTML minificado correctamente",
      errorMessage: "Error al minificar HTML",
    });
  }, [runTransformAction, inputHtml, minifyConfig, setError, setOutput]);

  return {
    handleClearInput: baseActions.handleClearInput,
    handleLoadExample: baseActions.handleLoadExample,
    handleCopyOutput,
    handleDownloadInput,
    handleDownloadOutput,
    handleFormat,
    handleMinify,
  };
}
