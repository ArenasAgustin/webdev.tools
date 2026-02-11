import { useCallback } from "react";
import { jsonPlaygroundConfig } from "@/playgrounds/json/json.config";
import { formatJson } from "@/services/json/format";
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
  ) => { ok: boolean; error?: string };
  minifyFn: (
    input: string,
    options?: Partial<MinifyConfig>,
  ) => { ok: boolean; error?: string };
  cleanFn: (
    input: string,
    options?: Partial<CleanConfig>,
  ) => { ok: boolean; error?: string };
  // JsonPath functions (instead of the whole object)
  jsonPathOutput: string;
  jsonPathExpression: string;
  setJsonPathExpression: (expr: string) => void;
  clearJsonPathOutput: () => void;
  filterJsonPath: (
    input: string,
    overrideExpression?: string,
  ) => {
    ok: boolean;
    error?: string;
  };
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
  const guardInputSize = useCallback(() => {
    if (!inputTooLarge) {
      return false;
    }

    if (toast) {
      toast.error(
        inputTooLargeMessage ||
          "El contenido es demasiado grande para procesarlo.",
      );
    }

    return true;
  }, [inputTooLarge, inputTooLargeMessage, toast]);
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
    if (guardInputSize()) {
      return;
    }

    const result = formatFn(inputJson, formatConfig);
    if (!result.ok && toast) {
      toast.error(result.error || "Error al formatear JSON");
    } else if (result.ok && toast) {
      toast.success("JSON formateado correctamente");
    }
  }, [inputJson, formatFn, formatConfig, toast, guardInputSize]);

  const handleMinify = useCallback(() => {
    if (guardInputSize()) {
      return;
    }

    const result = minifyFn(inputJson, minifyConfig);
    if (!result.ok && toast) {
      toast.error(result.error || "Error al minificar JSON");
    } else if (result.ok && toast) {
      toast.success("JSON minificado correctamente");
    }
  }, [inputJson, minifyFn, minifyConfig, toast, guardInputSize]);

  const handleClean = useCallback(() => {
    if (guardInputSize()) {
      return;
    }

    const result = cleanFn(inputJson, cleanConfig);
    if (!result.ok && toast) {
      toast.error(result.error || "Error al limpiar JSON");
    } else if (result.ok && toast) {
      toast.success("JSON limpiado correctamente");
    }
  }, [inputJson, cleanFn, cleanConfig, toast, guardInputSize]);

  const handleApplyJsonPath = useCallback(() => {
    if (guardInputSize()) {
      return;
    }

    const result = filterJsonPath(inputJson);
    if (result.ok) {
      addToHistory(jsonPathExpression);
    }
  }, [
    inputJson,
    filterJsonPath,
    addToHistory,
    jsonPathExpression,
    guardInputSize,
  ]);

  const handleReuseFromHistory = useCallback(
    (expression: string) => {
      if (guardInputSize()) {
        return;
      }

      setJsonPathExpression(expression);
      const result = filterJsonPath(inputJson, expression);
      if (result.ok) {
        addToHistory(expression);
      }
    },
    [
      inputJson,
      setJsonPathExpression,
      filterJsonPath,
      addToHistory,
      guardInputSize,
    ],
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
