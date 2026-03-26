import {
  useGenericPlaygroundActions,
  type PlaygroundFileConfig,
} from "./useGenericPlaygroundActions";
import { htmlPlaygroundConfig } from "@/playgrounds/html/html.config";
import { htmlService } from "@/services/html/service";
import type { ToastApi } from "./usePlaygroundActions";
import type { HtmlFormatConfig, HtmlMinifyConfig } from "@/types/html";

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
  toast,
}: UseHtmlPlaygroundActionsProps) {
  return useGenericPlaygroundActions({
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
}
