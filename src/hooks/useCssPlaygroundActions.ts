import { useGenericPlaygroundActions, type PlaygroundFileConfig } from "./useGenericPlaygroundActions";
import { cssPlaygroundConfig } from "@/playgrounds/css/css.config";
import { cssService } from "@/services/css/service";
import type { ToastApi } from "./usePlaygroundActions";
import type { CssFormatConfig, CssMinifyConfig } from "@/types/css";

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
  toast,
}: UseCssPlaygroundActionsProps) {
  return useGenericPlaygroundActions({
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
}
