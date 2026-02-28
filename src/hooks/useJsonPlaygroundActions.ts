import { useCallback } from "react";
import { jsonPlaygroundConfig } from "@/playgrounds/json/json.config";
import { createValidatedHandler } from "@/utils/handlerFactory";
import { usePlaygroundActions, type ToastApi } from "./usePlaygroundActions";
import { useTransformActions } from "./useTransformActions";
import type { FormatConfig, MinifyConfig, CleanConfig } from "@/types/json";

interface UseJsonPlaygroundActionsProps {
  inputJson: string;
  setInputJson: (value: string) => void;
  inputTooLarge?: boolean;
  inputTooLargeMessage?: string;
  // Formatter functions (instead of the whole object)
  formatterOutput: string;
  clearFormatterOutput: () => void;
  formatFn: (
    input: string,
    options?: Partial<FormatConfig>,
  ) => Promise<{ ok: boolean; error?: string }>;
  minifyFn: (
    input: string,
    options?: Partial<MinifyConfig>,
  ) => Promise<{ ok: boolean; error?: string }>;
  cleanFn: (
    input: string,
    options?: Partial<CleanConfig>,
  ) => Promise<{ ok: boolean; error?: string }>;
  // JsonPath functions (instead of the whole object)
  jsonPathOutput: string;
  jsonPathExpression: string;
  setJsonPathExpression: (expr: string) => void;
  clearJsonPathOutput: () => void;
  filterJsonPath: (
    input: string,
    overrideExpression?: string,
  ) => Promise<{
    ok: boolean;
    error?: string;
  }>;
  // JsonPathHistory function
  addToHistory: (expression: string) => Promise<void> | void;
  // Configs
  formatConfig: FormatConfig;
  minifyConfig: MinifyConfig;
  cleanConfig: CleanConfig;
  // Toast API
  toast?: ToastApi;
}

export function useJsonPlaygroundActions({
  inputJson,
  setInputJson,
  inputTooLarge,
  inputTooLargeMessage,
  formatterOutput,
  clearFormatterOutput,
  formatFn,
  minifyFn,
  cleanFn,
  jsonPathOutput,
  jsonPathExpression,
  setJsonPathExpression,
  clearJsonPathOutput,
  filterJsonPath,
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
      clearFormatterOutput();
      clearJsonPathOutput();
    }, [clearFormatterOutput, clearJsonPathOutput]),
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
    const textToCopy = jsonPathOutput || formatterOutput;
    baseActions.handleCopy({
      text: textToCopy,
      successMessage: "Resultado copiado al portapapeles",
      validate: () => (!textToCopy ? "No hay resultado para copiar" : null),
    });
  }, [formatterOutput, jsonPathOutput, baseActions]);

  const handleFormat = useCallback(() => {
    runTransformAction({
      run: () => {
        clearJsonPathOutput();
        return formatFn(inputJson, formatConfig);
      },
      successMessage: "JSON formateado correctamente",
      errorMessage: "Error al formatear JSON",
    });
  }, [runTransformAction, clearJsonPathOutput, formatFn, inputJson, formatConfig]);

  const handleMinify = useCallback(() => {
    runTransformAction({
      run: () => {
        clearJsonPathOutput();
        return minifyFn(inputJson, minifyConfig);
      },
      successMessage: "JSON minificado correctamente",
      errorMessage: "Error al minificar JSON",
    });
  }, [runTransformAction, clearJsonPathOutput, minifyFn, inputJson, minifyConfig]);

  const handleClean = useCallback(() => {
    runTransformAction({
      run: () => {
        clearJsonPathOutput();
        return cleanFn(inputJson, cleanConfig);
      },
      successMessage: "JSON limpiado correctamente",
      errorMessage: "Error al limpiar JSON",
    });
  }, [runTransformAction, clearJsonPathOutput, cleanFn, inputJson, cleanConfig]);

  const handleApplyJsonPath = useCallback(() => {
    createValidatedHandler({
      validate: baseActions.createInputValidator,
      run: () => filterJsonPath(inputJson),
      onSuccess: () => addToHistory(jsonPathExpression),
      toast,
      errorMessage: "Error al aplicar JSONPath",
    })();
  }, [baseActions, filterJsonPath, inputJson, addToHistory, jsonPathExpression, toast]);

  const handleReuseFromHistory = useCallback(
    (expression: string) => {
      createValidatedHandler({
        validate: baseActions.createInputValidator,
        run: () => {
          setJsonPathExpression(expression);
          return filterJsonPath(inputJson, expression);
        },
        onSuccess: () => addToHistory(expression),
        toast,
        errorMessage: "Error al aplicar JSONPath",
      })();
    },
    [baseActions, setJsonPathExpression, filterJsonPath, inputJson, addToHistory, toast],
  );

  return {
    handleClearInput: baseActions.handleClearInput,
    handleLoadExample: baseActions.handleLoadExample,
    handleCopyOutput,
    handleFormat,
    handleMinify,
    handleClean,
    handleApplyJsonPath,
    handleReuseFromHistory,
  };
}
