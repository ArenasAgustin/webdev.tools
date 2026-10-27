import { useCallback } from "react";
import { phpPlaygroundConfig } from "@/playgrounds/php/php.config";
import { phpService } from "@/services/php/service";
import { createTransformHandler } from "@/utils/createTransformHandler";
import { createValidatedHandler } from "@/utils/handlerFactory";
import { translate } from "@/i18n/translate";
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
  if (!result.ok) throw new Error(result.error ?? translate("messages.formatCodeError"));
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
      throw new Error(translate("messages.php.minifyUnavailable"));
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
        if (!result.ok) throw new Error(result.error ?? translate("messages.php.formatCodeError"));
        return result.value;
      },
      setOutput,
      setError,
      autoCopy: formatConfig.autoCopy,
      successMessage: translate("messages.formatted", { language: FILE_CONFIG.language }),
      errorMessage: translate("messages.formatError", { language: FILE_CONFIG.language }),
    });
  }, [generic.runTransformAction, inputPhp, formatConfig, setError, setOutput]);

  // Extensión: ejecutar código PHP
  const handleExecute = useCallback(() => {
    // What the script printed before a fatal error, shown next to the error.
    let partialOutput = "";
    createValidatedHandler({
      validate: generic.baseActions.createInputValidator,
      run: async () => {
        generic.setIsProcessing(true);
        setError(null);
        setOutput("");

        const { executePhpWithTimeout, isSharedArrayBufferSupported } = await import(
          "@/services/php/phpExecutor"
        );

        if (!isSharedArrayBufferSupported()) {
          throw new Error(translate("messages.php.sharedArrayBufferUnsupported"));
        }

        const result = await executePhpWithTimeout(inputPhp);
        generic.setIsProcessing(false);

        if (!result.ok) {
          partialOutput = result.error.output ?? "";
          throw new Error(result.error.message);
        }

        setOutput(result.value);
      },
      toast,
      successMessage: translate("messages.php.executed"),
      onError: (message) => {
        generic.setIsProcessing(false);
        // Also reached when validation fails before `run`, so clear the previous result here.
        setOutput(partialOutput);
        setError(message);
      },
    })();
  }, [generic, inputPhp, setError, setOutput, toast]);

  return {
    ...generic,
    handleFormat,
    handleExecute,
  };
}
