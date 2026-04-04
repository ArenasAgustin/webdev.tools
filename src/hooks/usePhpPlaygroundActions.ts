import { useCallback } from "react";
import { phpPlaygroundConfig } from "@/playgrounds/php/php.config";
import { phpService } from "@/services/php/service";
import { createTransformHandler } from "@/utils/createTransformHandler";
import {
  useGenericPlaygroundActions,
  type PlaygroundFileConfig,
} from "./useGenericPlaygroundActions";
import type { ToastApi } from "./usePlaygroundActions";
import type { PhpFormatConfig } from "@/types/php";

const FILE_CONFIG: PlaygroundFileConfig = {
  inputFileName: "code.php",
  outputFileName: "output.txt",
  mimeType: "application/x-php",
  language: "PHP",
  acceptExtensions: ".php",
};

async function formatRunner(input: string, config: PhpFormatConfig) {
  const result = await phpService.format(input, { indentSize: config.indentSize });
  if (!result.ok) throw new Error(result.error ?? "Error al formatear código");
  return result.value;
}

interface UsePhpPlaygroundActionsProps {
  inputPhp: string;
  setInputPhp: (value: string) => void;
  output: string;
  setOutput: (value: string) => void;
  setError: (error: string | null) => void;
  inputTooLarge?: boolean;
  inputTooLargeMessage?: string;
  formatConfig: PhpFormatConfig;
  minifyConfig: { autoCopy?: boolean };
  toast?: ToastApi;
}

export function usePhpPlaygroundActions({
  inputPhp,
  setInputPhp,
  output,
  setOutput,
  setError,
  inputTooLarge,
  inputTooLargeMessage,
  formatConfig,
  minifyConfig,
  toast,
}: UsePhpPlaygroundActionsProps) {
  const generic = useGenericPlaygroundActions({
    input: inputPhp,
    setInput: setInputPhp,
    output,
    setOutput,
    setError,
    inputTooLarge,
    inputTooLargeMessage,
    formatConfig,
    minifyConfig,
    toast,
    exampleContent: phpPlaygroundConfig.example,
    fileConfig: FILE_CONFIG,
    formatRunner,
    minifyRunner: async () => {
      throw new Error("Minify no está disponible para PHP");
    },
  });

  // Extensión: formatear código PHP con validación
  const handleFormat = useCallback(() => {
    createTransformHandler({
      runTransformAction: generic.runTransformAction,
      run: async () => {
        const result = await phpService.format(inputPhp, {
          indentSize: formatConfig.indentSize,
        });
        if (!result.ok) throw new Error(result.error ?? "Error al formatear código PHP");
        return result.value;
      },
      setOutput,
      setError,
      autoCopy: formatConfig.autoCopy,
      successMessage: "PHP formateado correctamente",
      errorMessage: "Error al formatear PHP",
    });
  }, [generic.runTransformAction, inputPhp, formatConfig, setError, setOutput]);

  return {
    ...generic,
    handleFormat,
    minifyRunner: async () => {
      throw new Error("Minify no está disponible para PHP");
    },
  };
}
