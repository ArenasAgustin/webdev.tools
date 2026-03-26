import { useCallback } from "react";
import { jsonPlaygroundConfig } from "@/playgrounds/json/json.config";
import { createValidatedHandler } from "@/utils/handlerFactory";
import { createTransformHandler } from "@/utils/createTransformHandler";
import { compactTransformError } from "@/utils/transformError";
import {
  useGenericPlaygroundActions,
  type PlaygroundFileConfig,
} from "./useGenericPlaygroundActions";
import type { ToastApi } from "./usePlaygroundActions";
import {
  formatJsonAsync,
  minifyJsonAsync,
  cleanJsonAsync,
  applyJsonPathAsync,
} from "@/services/json/worker";
import type { JsonFormatConfig, JsonMinifyConfig, JsonCleanConfig } from "@/types/json";

const FILE_CONFIG: PlaygroundFileConfig = {
  inputFileName: "data.json",
  outputFileName: "result.json",
  mimeType: "application/json",
  language: "JSON",
  acceptExtensions: ".json",
};

const exampleContent = (() => {
  try {
    return JSON.stringify(JSON.parse(jsonPlaygroundConfig.example), null, 2);
  } catch {
    return jsonPlaygroundConfig.example;
  }
})();

async function formatRunner(input: string, config: JsonFormatConfig) {
  const result = await formatJsonAsync(input, {
    indentSize: config.indentSize,
    sortKeys: config.sortKeys,
  });
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
}

async function minifyRunner(input: string, config: JsonMinifyConfig) {
  const result = await minifyJsonAsync(input, {
    removeSpaces: config.removeSpaces,
    sortKeys: config.sortKeys,
  });
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
}

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
  const generic = useGenericPlaygroundActions({
    input: inputJson,
    setInput: setInputJson,
    output,
    setOutput,
    setError,
    inputTooLarge,
    inputTooLargeMessage,
    formatConfig,
    minifyConfig,
    toast,
    exampleContent,
    fileConfig: FILE_CONFIG,
    formatRunner,
    minifyRunner,
  });

  // Extensión: limpiar JSON
  const handleClean = useCallback(() => {
    createTransformHandler({
      runTransformAction: generic.runTransformAction,
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
      setOutput,
      setError,
      autoCopy: cleanConfig.autoCopy,
      successMessage: "JSON limpiado correctamente",
      errorMessage: "Error al limpiar JSON",
    });
  }, [generic.runTransformAction, inputJson, cleanConfig, setError, setOutput]);

  // Extensión: aplicar JSONPath
  const handleApplyJsonPath = useCallback(() => {
    void createValidatedHandler({
      validate: generic.baseActions.createInputValidator,
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
    generic.baseActions,
    jsonPathExpression,
    inputJson,
    addToHistory,
    setOutput,
    setError,
    toast,
  ]);

  // Extensión: reutilizar expresión de historial
  const handleReuseFromHistory = useCallback(
    (expression: string) => {
      void createValidatedHandler({
        validate: generic.baseActions.createInputValidator,
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
    [generic.baseActions, setJsonPathExpression, inputJson, addToHistory, setOutput, setError, toast],
  );

  return {
    ...generic,
    handleClean,
    handleApplyJsonPath,
    handleReuseFromHistory,
  };
}
