import { useCallback, useMemo, useRef } from "react";
import { jsonPlaygroundConfig } from "@/playgrounds/json/json.config";
import { createValidatedHandler } from "@/utils/handlerFactory";
import { createTransformHandler } from "@/utils/createTransformHandler";
import { compactTransformError } from "@/utils/transformError";
import { translate } from "@/i18n/translate";
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
import { detectJsonLoss } from "@/services/json/lossDetection";
import type { JsonFormatConfig, JsonMinifyConfig, JsonCleanConfig } from "@/types/json";

const FILE_CONFIG: PlaygroundFileConfig = {
  inputFileName: "data.json",
  outputFileName: "output.json",
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

/**
 * JSON.parse/stringify silently round big integers, turn 1e400 into null and keep
 * only the last of duplicate keys; tell the user when the input had any of those.
 */
function warnAboutSilentChanges(input: string, toast: ToastApi | undefined) {
  if (!toast?.info) return;
  const { precisionLoss, duplicateKeys } = detectJsonLoss(input);
  if (precisionLoss) toast.info(translate("messages.json.precisionLoss"));
  if (duplicateKeys) toast.info(translate("messages.json.duplicateKeys"));
}

/** Drops the toasts of a JSONPath request that a newer one has superseded. */
function latestOnlyToast(toast: ToastApi | undefined, isLatest: () => boolean): ToastApi {
  return {
    success: (message) => {
      if (isLatest()) toast?.success(message);
    },
    error: (message) => {
      if (isLatest()) toast?.error(message);
    },
  };
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
  addToHistory,
  formatConfig,
  minifyConfig,
  cleanConfig,
  toast,
}: UseJsonPlaygroundActionsProps) {
  const formatWithWarning = useCallback(
    async (input: string, config: JsonFormatConfig) => {
      const value = await formatRunner(input, config);
      warnAboutSilentChanges(input, toast);
      return value;
    },
    [toast],
  );

  const minifyWithWarning = useCallback(
    async (input: string, config: JsonMinifyConfig) => {
      const value = await minifyRunner(input, config);
      warnAboutSilentChanges(input, toast);
      return value;
    },
    [toast],
  );

  // JSON line breaks are only whitespace, so hand copy/download a LF-only output
  // (an input loaded from a Windows file and reused as result would keep CRLF).
  const outputLf = useMemo(() => output.replace(/\r\n?/g, "\n"), [output]);

  const generic = useGenericPlaygroundActions({
    input: inputJson,
    setInput: setInputJson,
    output: outputLf,
    setOutput,
    setError,
    inputTooLarge,
    inputTooLargeMessage,
    formatConfig,
    minifyConfig,
    toast,
    exampleContent,
    fileConfig: FILE_CONFIG,
    formatRunner: formatWithWarning,
    minifyRunner: minifyWithWarning,
  });

  // Id of the latest JSONPath request. Queries are not exclusive (the user may refine the
  // expression and press Enter again), so a slower earlier query must not overwrite the result.
  const jsonPathRequestRef = useRef(0);

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
        if (!result.value.trim()) throw new Error(translate("messages.cleanEmpty", { language: "JSON" }));
        warnAboutSilentChanges(inputJson, toast);
        return result.value;
      },
      setOutput,
      setError,
      autoCopy: cleanConfig.autoCopy,
      successMessage: translate("messages.cleaned", { language: "JSON" }),
      errorMessage: translate("messages.cleanError", { language: "JSON" }),
    });
  }, [generic.runTransformAction, inputJson, cleanConfig, setError, setOutput, toast]);

  // Extensión: aplicar JSONPath
  const handleApplyJsonPath = useCallback(() => {
    const requestId = ++jsonPathRequestRef.current;
    const isLatest = () => requestId === jsonPathRequestRef.current;
    void createValidatedHandler({
      validate: generic.baseActions.createInputValidator,
      run: async () => {
        if (!jsonPathExpression.trim()) {
          throw new Error(translate("messages.json.jsonPathRequired"));
        }
        const result = await applyJsonPathAsync(inputJson, jsonPathExpression);
        if (!result.ok) throw new Error(result.error.message);
        return result.value;
      },
      onSuccess: (value) => {
        if (!isLatest()) return;
        if (!value.trim() || value === "[]" || value === "{}") {
          setOutput(value);
          setError(translate("messages.json.noResults"));
        } else {
          setOutput(value);
          setError(null);
        }
        void addToHistory(jsonPathExpression);
      },
      onError: (message) => {
        if (!isLatest()) return;
        setOutput("");
        setError(compactTransformError(message));
      },
      toast: latestOnlyToast(toast, isLatest),
      errorMessage: translate("messages.json.jsonPathError"),
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

  return {
    ...generic,
    handleClean,
    handleApplyJsonPath,
  };
}
