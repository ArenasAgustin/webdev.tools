import { useCallback } from "react";
import { jsonPlaygroundConfig } from "@/playgrounds/json/json.config";
import { formatJson } from "@/services/json/format";
import { createValidatedHandler } from "@/utils/handlerFactory";
import type { FormatConfig, MinifyConfig, CleanConfig } from "@/types/json";

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

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
  const validateInputSize = useCallback(
    () =>
      inputTooLarge
        ? (inputTooLargeMessage ?? "El contenido es demasiado grande para procesarlo.")
        : null,
    [inputTooLarge, inputTooLargeMessage],
  );
  const handleClearInput = useCallback(() => {
    setInputJson("");
    clearFormatterOutput();
    clearJsonPathOutput();
    if (toast) {
      toast.success("Entrada limpiada");
    }
  }, [setInputJson, clearFormatterOutput, clearJsonPathOutput, toast]);

  const handleLoadExample = useCallback(() => {
    const result = formatJson(jsonPlaygroundConfig.example);
    if (result.ok) {
      setInputJson(result.value);
    } else {
      setInputJson(jsonPlaygroundConfig.example);
    }
    clearFormatterOutput();
    clearJsonPathOutput();
    if (toast) {
      toast.success("Ejemplo cargado");
    }
  }, [setInputJson, clearFormatterOutput, clearJsonPathOutput, toast]);

  const handleCopyOutput = useCallback(() => {
    const textToCopy = jsonPathOutput || formatterOutput;
    navigator.clipboard.writeText(textToCopy).catch((err) => {
      console.error("Error al copiar al portapapeles: ", err);
    });
  }, [formatterOutput, jsonPathOutput]);

  const handleFormat = useCallback(() => {
    createValidatedHandler({
      validate: validateInputSize,
      run: () => {
        clearJsonPathOutput();
        return formatFn(inputJson, formatConfig);
      },
      toast,
      successMessage: "JSON formateado correctamente",
      errorMessage: "Error al formatear JSON",
    })();
  }, [validateInputSize, clearJsonPathOutput, formatFn, inputJson, formatConfig, toast]);

  const handleMinify = useCallback(() => {
    createValidatedHandler({
      validate: validateInputSize,
      run: () => {
        clearJsonPathOutput();
        return minifyFn(inputJson, minifyConfig);
      },
      toast,
      successMessage: "JSON minificado correctamente",
      errorMessage: "Error al minificar JSON",
    })();
  }, [validateInputSize, clearJsonPathOutput, minifyFn, inputJson, minifyConfig, toast]);

  const handleClean = useCallback(() => {
    createValidatedHandler({
      validate: validateInputSize,
      run: () => {
        clearJsonPathOutput();
        return cleanFn(inputJson, cleanConfig);
      },
      toast,
      successMessage: "JSON limpiado correctamente",
      errorMessage: "Error al limpiar JSON",
    })();
  }, [validateInputSize, clearJsonPathOutput, cleanFn, inputJson, cleanConfig, toast]);

  const handleApplyJsonPath = useCallback(() => {
    createValidatedHandler({
      validate: validateInputSize,
      run: () => filterJsonPath(inputJson),
      onSuccess: () => addToHistory(jsonPathExpression),
      toast,
      errorMessage: "Error al aplicar JSONPath",
    })();
  }, [validateInputSize, filterJsonPath, inputJson, addToHistory, jsonPathExpression, toast]);

  const handleReuseFromHistory = useCallback(
    (expression: string) => {
      createValidatedHandler({
        validate: validateInputSize,
        run: () => {
          setJsonPathExpression(expression);
          return filterJsonPath(inputJson, expression);
        },
        onSuccess: () => addToHistory(expression),
        toast,
        errorMessage: "Error al aplicar JSONPath",
      })();
    },
    [validateInputSize, setJsonPathExpression, filterJsonPath, inputJson, addToHistory, toast],
  );

  return {
    handleClearInput,
    handleLoadExample,
    handleCopyOutput,
    handleFormat,
    handleMinify,
    handleClean,
    handleApplyJsonPath,
    handleReuseFromHistory,
  };
}
