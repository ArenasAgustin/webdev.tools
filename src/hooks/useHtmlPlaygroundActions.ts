import { useCallback } from "react";
import {
  useGenericPlaygroundActions,
  type PlaygroundFileConfig,
} from "./useGenericPlaygroundActions";
import { htmlPlaygroundConfig } from "@/playgrounds/html/html.config";
import { htmlService } from "@/services/html/service";
import { createTransformHandler } from "@/utils/createTransformHandler";
import { translate } from "@/i18n/translate";
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
  if (!result.ok) throw new Error(result.error || translate("messages.formatError", { language: FILE_CONFIG.language }));
  return result.value;
}

async function minifyRunner(input: string, config: HtmlMinifyConfig) {
  const result = await htmlService.minify(input, {
    removeComments: config.removeComments,
    collapseWhitespace: config.collapseWhitespace,
    minifyCss: config.minifyCss,
    minifyJs: config.minifyJs,
  });
  if (!result.ok) throw new Error(result.error || translate("messages.minifyError", { language: FILE_CONFIG.language }));
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
        if (!result.value.trim()) throw new Error(translate("messages.cleanEmpty", { language: FILE_CONFIG.language }));
        return result.value;
      },
      setOutput,
      setError,
      autoCopy: cleanConfig.autoCopy,
      successMessage: translate("messages.cleaned", { language: FILE_CONFIG.language }),
      errorMessage: translate("messages.cleanError", { language: FILE_CONFIG.language }),
    });
  }, [generic.runTransformAction, inputHtml, cleanConfig, setError, setOutput]);

  return {
    ...generic,
    handleClean,
  };
}
