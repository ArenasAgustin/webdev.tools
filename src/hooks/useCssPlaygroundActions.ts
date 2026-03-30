import { useCallback } from "react";
import {
  useGenericPlaygroundActions,
  type PlaygroundFileConfig,
} from "./useGenericPlaygroundActions";
import { cssPlaygroundConfig } from "@/playgrounds/css/css.config";
import { cssService } from "@/services/css/service";
import { createTransformHandler } from "@/utils/createTransformHandler";
import type { ToastApi } from "./usePlaygroundActions";
import type { CssFormatConfig, CssMinifyConfig, CssCleanConfig } from "@/types/css";
import { cleanCssAsync } from "@/services/css/worker";

const FILE_CONFIG: PlaygroundFileConfig = {
  inputFileName: "styles.css",
  outputFileName: "result.css",
  mimeType: "text/css",
  language: "CSS",
  acceptExtensions: ".css,.scss",
};

async function formatRunner(input: string, config: CssFormatConfig) {
  const result = await cssService.format(input, config.indentSize);
  if (!result.ok) throw new Error(result.error || "Error al formatear CSS");
  return result.value;
}

async function minifyRunner(input: string, config: CssMinifyConfig) {
  const result = await cssService.minify(input, {
    removeComments: config.removeComments,
    removeSpaces: config.removeSpaces,
  });
  if (!result.ok) throw new Error(result.error || "Error al minificar CSS");
  return result.value;
}

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
  cleanConfig: CssCleanConfig;
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
  cleanConfig,
  toast,
}: UseCssPlaygroundActionsProps) {
  const generic = useGenericPlaygroundActions({
    input: inputCss,
    setInput: setInputCss,
    output,
    setOutput,
    setError,
    inputTooLarge,
    inputTooLargeMessage,
    formatConfig,
    minifyConfig,
    toast,
    exampleContent: cssPlaygroundConfig.example,
    fileConfig: FILE_CONFIG,
    formatRunner,
    minifyRunner,
  });

  // Extensión: limpiar CSS
  const handleClean = useCallback(() => {
    createTransformHandler({
      runTransformAction: generic.runTransformAction,
      run: async () => {
        const result = await cleanCssAsync(inputCss, {
          removeEmptyRules: cleanConfig.removeEmptyRules,
          removeRulesWithOnlyComments: cleanConfig.removeRulesWithOnlyComments,
        });
        if (!result.ok) throw new Error(result.error.message);
        if (!result.value.trim()) throw new Error("El CSS estaba completamente vacío");
        return result.value;
      },
      setOutput,
      setError,
      autoCopy: cleanConfig.autoCopy,
      successMessage: "CSS limpiado correctamente",
      errorMessage: "Error al limpiar CSS",
    });
  }, [generic.runTransformAction, inputCss, cleanConfig, setError, setOutput]);

  return {
    ...generic,
    handleClean,
  };
}
