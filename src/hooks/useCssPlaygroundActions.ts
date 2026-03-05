import { useCallback } from "react";
import { usePlaygroundActions, type ToastApi } from "./usePlaygroundActions";
import { useTransformActions } from "./useTransformActions";
import { cssPlaygroundConfig } from "@/playgrounds/css/css.config";
import { formatCss, minifyCss } from "@/services/css/transform";
import type { CssFormatConfig, CssMinifyConfig } from "@/types/css";

interface UseCssPlaygroundActionsProps {
  inputCss: string;
  setInputCss: (value: string) => void;
  output: string;
  setOutput: (value: string) => void;
  setError: (error: string | null) => void;
  inputTooLarge?: boolean;
  inputTooLargeMessage?: string;
  formatConfig: CssFormatConfig;
  minifyConfig: CssMinifyConfig;
  toast?: ToastApi;
}

export function useCssPlaygroundActions({
  inputCss,
  setInputCss,
  output,
  setOutput,
  setError,
  inputTooLarge,
  inputTooLargeMessage,
  formatConfig,
  minifyConfig,
  toast,
}: UseCssPlaygroundActionsProps) {
  const baseActions = usePlaygroundActions({
    input: inputCss,
    setInput: setInputCss,
    exampleContent: cssPlaygroundConfig.example,
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
      content: inputCss,
      fileName: "styles.css",
      mimeType: "text/css",
      successMessage: "Descargado como styles.css",
      validate: () => (!inputCss ? "No hay CSS para descargar" : null),
    });
  }, [baseActions, inputCss]);

  const handleDownloadOutput = useCallback(() => {
    baseActions.handleDownload({
      content: output,
      fileName: "result.css",
      mimeType: "text/css",
      successMessage: "Descargado como result.css",
      validate: () => (!output ? "No hay resultado para descargar" : null),
    });
  }, [baseActions, output]);

  const handleFormat = useCallback(() => {
    runTransformAction({
      run: async () => {
        const result = await formatCss(inputCss, formatConfig.indentSize);

        if (!result.ok) {
          throw new Error(result.error || "Error al formatear CSS");
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
        setError(compactCssError(message));
      },
      successMessage: "CSS formateado correctamente",
      errorMessage: "Error al formatear CSS",
    });
  }, [runTransformAction, inputCss, formatConfig, setError, setOutput]);

  const handleMinify = useCallback(() => {
    runTransformAction({
      run: async () => {
        const result = await minifyCss(inputCss, {
          removeComments: minifyConfig.removeComments,
          removeSpaces: minifyConfig.removeSpaces,
        });

        if (!result.ok) {
          throw new Error(result.error || "Error al minificar CSS");
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
        setError(compactCssError(message));
      },
      successMessage: "CSS minificado correctamente",
      errorMessage: "Error al minificar CSS",
    });
  }, [runTransformAction, inputCss, minifyConfig, setError, setOutput]);

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

function compactCssError(message: string): string {
  const firstLine = message
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  const compact = (firstLine ?? message).replace(/\s{2,}/g, " ").trim();
  return compact.length > 140 ? `${compact.slice(0, 137)}...` : compact;
}
