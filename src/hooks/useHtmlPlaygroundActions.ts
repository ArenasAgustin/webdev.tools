import { useCallback } from "react";
import {
  useGenericPlaygroundActions,
  type PlaygroundFileConfig,
} from "./useGenericPlaygroundActions";
import { htmlPlaygroundConfig } from "@/playgrounds/html/html.config";
import { htmlService } from "@/services/html/service";
import { createTransformHandler } from "@/utils/createTransformHandler";
import type { ToastApi } from "./usePlaygroundActions";
import type { HtmlFormatConfig, HtmlMinifyConfig, HtmlCleanConfig } from "@/types/html";
import { cleanHtmlAsync } from "@/services/html/worker";

const FILE_CONFIG: PlaygroundFileConfig = {
  inputFileName: "index.html",
  outputFileName: "result.html",
  mimeType: "text/html",
  language: "HTML",
  acceptExtensions: ".html,.htm",
};

async function formatRunner(input: string, config: HtmlFormatConfig) {
  const result = await htmlService.format(input, {
    indentSize: config.indentSize,
    formatCss: config.formatCss,
    formatJs: config.formatJs,
  });
  if (!result.ok) throw new Error(result.error || "Error al formatear HTML");
  return result.value;
}

async function minifyRunner(input: string, config: HtmlMinifyConfig) {
  const result = await htmlService.minify(input, {
    removeComments: config.removeComments,
    collapseWhitespace: config.collapseWhitespace,
    minifyCss: config.minifyCss,
    minifyJs: config.minifyJs,
  });
  if (!result.ok) throw new Error(result.error || "Error al minificar HTML");
  return result.value;
}

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
  cleanConfig: HtmlCleanConfig;
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
  cleanConfig,
  toast,
}: UseHtmlPlaygroundActionsProps) {
  const generic = useGenericPlaygroundActions({
    input: inputHtml,
    setInput: setInputHtml,
    output,
    setOutput,
    setError,
    inputTooLarge,
    inputTooLargeMessage,
    formatConfig,
    minifyConfig,
    toast,
    exampleContent: htmlPlaygroundConfig.example,
    fileConfig: FILE_CONFIG,
    formatRunner,
    minifyRunner,
  });

  // Extensión: limpiar HTML
  const handleClean = useCallback(() => {
    createTransformHandler({
      runTransformAction: generic.runTransformAction,
      run: async () => {
        const result = await cleanHtmlAsync(inputHtml, {
          removeEmptyTags: cleanConfig.removeEmptyTags,
        });
        if (!result.ok) throw new Error(result.error.message);
        if (!result.value.trim()) throw new Error("El HTML estaba completamente vacío");
        return result.value;
      },
      setOutput,
      setError,
      autoCopy: cleanConfig.autoCopy,
      successMessage: "HTML limpiado correctamente",
      errorMessage: "Error al limpiar HTML",
    });
  }, [generic.runTransformAction, inputHtml, cleanConfig, setError, setOutput]);

  return {
    ...generic,
    handleClean,
  };
}
