import { useCallback } from "react";
import { jsonPlaygroundConfig } from "@/playgrounds/json/json.config";
import { createValidatedHandler } from "@/utils/handlerFactory";
import { usePlaygroundActions, type ToastApi } from "./usePlaygroundActions";
import { useTransformActions } from "./useTransformActions";
import { compactTransformError } from "@/utils/transformError";
import {
  formatJsonAsync,
  minifyJsonAsync,
  cleanJsonAsync,
  applyJsonPathAsync,
} from "@/services/json/worker";
import type { JsonFormatConfig, JsonMinifyConfig, JsonCleanConfig } from "@/types/json";

interface UseJsonPlaygroundActionsProps {
  inputJson: string;
  setInputJson: (value: string) => void;
  output: string;
  setOutput: (value: string) => void;
  setError: (error: string | null) => void;
  inputTooLarge?: boolean;
  inputTooLargeMessage?: string;
  // JSONPath
  jsonPathExpression: string;
  setJsonPathExpression: (expr: string) => void;
  addToHistory: (expression: string) => Promise<void> | void;
  // Configs
  formatConfig: JsonFormatConfig;
  minifyConfig: JsonMinifyConfig;
  cleanConfig: JsonCleanConfig;
  // Toast API
  toast?: ToastApi;
}

export function useJsonPlaygroundActions({
  inputJson,
  setInputJson,
  output,
  setOutput,
  setError,
  inputTooLarge,
  inputTooLargeMessage,
  jsonPathExpression,
  setJsonPathExpression,
  addToHistory,
  formatConfig,
  minifyConfig,
  cleanConfig,
  toast,
}: UseJsonPlaygroundActionsProps) {
  // Get base playground actions
  const exampleContent = useCallback(() => {
    try {
      return JSON.stringify(JSON.parse(jsonPlaygroundConfig.example), null, 2);
    } catch {
      return jsonPlaygroundConfig.example;
    }
  }, [])();

  const baseActions = usePlaygroundActions({
    input: inputJson,
    setInput: setInputJson,
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
      content: inputJson,
      fileName: "data.json",
      mimeType: "application/json",
      successMessage: "Descargado como data.json",
      validate: () => (!inputJson ? "No hay contenido para descargar" : null),
    });
  }, [baseActions, inputJson]);

  const handleDownloadOutput = useCallback(() => {
    baseActions.handleDownload({
      content: output,
      fileName: "result.json",
      mimeType: "application/json",
      successMessage: "Descargado como result.json",
      validate: () => (!output ? "No hay resultado para descargar" : null),
    });
  }, [baseActions, output]);

  const handleFormat = useCallback(() => {
    runTransformAction({
      run: async () => {
        const result = await formatJsonAsync(inputJson, {
          indentSize: formatConfig.indentSize,
          sortKeys: formatConfig.sortKeys,
        });
        if (!result.ok) throw new Error(result.error.message);
        return result.value;
      },
      onSuccess: (value) => {
        setError(null);
        setOutput(value);
        if (formatConfig.autoCopy && value) {
          navigator.clipboard.writeText(value).catch(() => undefined);
        }
      },
      onError: (message) => {
        setError(compactTransformError(message));
      },
      successMessage: "JSON formateado correctamente",
      errorMessage: "Error al formatear JSON",
    });
  }, [runTransformAction, inputJson, formatConfig, setError, setOutput]);

  const handleMinify = useCallback(() => {
    runTransformAction({
      run: async () => {
        const result = await minifyJsonAsync(inputJson, {
          removeSpaces: minifyConfig.removeSpaces,
          sortKeys: minifyConfig.sortKeys,
        });
        if (!result.ok) throw new Error(result.error.message);
        return result.value;
      },
      onSuccess: (value) => {
        setError(null);
        setOutput(value);
        if (minifyConfig.autoCopy && value) {
          navigator.clipboard.writeText(value).catch(() => undefined);
        }
      },
      onError: (message) => {
        setError(compactTransformError(message));
      },
      successMessage: "JSON minificado correctamente",
      errorMessage: "Error al minificar JSON",
    });
  }, [runTransformAction, inputJson, minifyConfig, setError, setOutput]);

  const handleClean = useCallback(() => {
    runTransformAction({
      run: async () => {
        const result = await cleanJsonAsync(inputJson, {
          removeNull: cleanConfig.removeNull,
          removeUndefined: cleanConfig.removeUndefined,
          removeEmptyString: cleanConfig.removeEmptyString,
          removeEmptyArray: cleanConfig.removeEmptyArray,
          removeEmptyObject: cleanConfig.removeEmptyObject,
          outputFormat: cleanConfig.outputFormat,
        });
        if (!result.ok) throw new Error(result.error.message);
        if (!result.value.trim()) throw new Error("El JSON estaba completamente vacío");
        return result.value;
      },
      onSuccess: (value) => {
        setError(null);
        setOutput(value);
        if (cleanConfig.autoCopy && value) {
          navigator.clipboard.writeText(value).catch(() => undefined);
        }
      },
      onError: (message) => {
        setError(compactTransformError(message));
      },
      successMessage: "JSON limpiado correctamente",
      errorMessage: "Error al limpiar JSON",
    });
  }, [runTransformAction, inputJson, cleanConfig, setError, setOutput]);

  const handleApplyJsonPath = useCallback(() => {
    void createValidatedHandler({
      validate: baseActions.createInputValidator,
      run: async () => {
        if (!jsonPathExpression.trim()) {
          throw new Error("Ingresa una expresión JSONPath");
        }
        const result = await applyJsonPathAsync(inputJson, jsonPathExpression);
        if (!result.ok) throw new Error(result.error.message);
        return result.value;
      },
      onSuccess: (value) => {
        if (!value.trim() || value === "[]" || value === "{}") {
          setOutput(value);
          setError("El filtro no devolvió resultados");
        } else {
          setOutput(value);
          setError(null);
        }
        void addToHistory(jsonPathExpression);
      },
      onError: (message) => {
        setError(compactTransformError(message));
      },
      toast,
      errorMessage: "Error al aplicar JSONPath",
    })();
  }, [
    baseActions,
    jsonPathExpression,
    inputJson,
    addToHistory,
    setOutput,
    setError,
    toast,
  ]);

  const handleReuseFromHistory = useCallback(
    (expression: string) => {
      void createValidatedHandler({
        validate: baseActions.createInputValidator,
        run: async () => {
          setJsonPathExpression(expression);
          const result = await applyJsonPathAsync(inputJson, expression);
          if (!result.ok) throw new Error(result.error.message);
          return result.value;
        },
        onSuccess: (value) => {
          if (!value.trim() || value === "[]" || value === "{}") {
            setOutput(value);
            setError("El filtro no devolvió resultados");
          } else {
            setOutput(value);
            setError(null);
          }
          void addToHistory(expression);
        },
        onError: (message) => {
          setError(compactTransformError(message));
        },
        toast,
        errorMessage: "Error al aplicar JSONPath",
      })();
    },
    [baseActions, setJsonPathExpression, inputJson, addToHistory, setOutput, setError, toast],
  );

  return {
    handleClearInput: baseActions.handleClearInput,
    handleLoadExample: baseActions.handleLoadExample,
    handleCopyOutput,
    handleDownloadInput,
    handleDownloadOutput,
    handleFormat,
    handleMinify,
    handleClean,
    handleApplyJsonPath,
    handleReuseFromHistory,
  };
}
