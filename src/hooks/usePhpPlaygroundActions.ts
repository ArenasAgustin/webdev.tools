import { useCallback } from "react";
import { phpFileSettings, phpPlaygroundConfig } from "@/playgrounds/php/php.config";
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
  ...phpFileSettings,
  language: "PHP",
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
    // Set when the formatter returned the input unchanged, so the toast can say so
    // instead of claiming the code was formatted.
    let unchanged = false;
    createTransformHandler({
      runTransformAction: (options) =>
        generic.runTransformAction({
          ...options,
          // The success toast is chosen here, once the result is known.
          successMessage: "",
          onSuccess: (value: string) => {
            options.onSuccess?.(value);
            if (unchanged) {
              const message = translate("messages.alreadyFormatted", { language: FILE_CONFIG.language });
              if (toast?.info) toast.info(message);
              else toast?.success(message);
            } else {
              toast?.success(options.successMessage);
            }
          },
        }),
      run: async () => {
        const result = await phpService.format(inputPhp, {
          indentSize: formatConfig.indentSize,
        });
        if (!result.ok) throw new Error(result.error ?? translate("messages.php.formatCodeError"));
        unchanged = result.value === inputPhp;
        return result.value;
      },
      setOutput,
      setError,
      autoCopy: formatConfig.autoCopy,
      successMessage: translate("messages.formatted", { language: FILE_CONFIG.language }),
      errorMessage: translate("messages.formatError", { language: FILE_CONFIG.language }),
    });
  }, [generic, inputPhp, formatConfig, setError, setOutput, toast]);

  // Extensión: ejecutar código PHP
  const handleExecute = useCallback(() => {
    // Ignore a second trigger while a run is in flight so two scripts never run at once.
    if (!generic.beginProcessing()) return;
    // What the script printed before a fatal error, shown next to the error.
    let partialOutput = "";
    createValidatedHandler({
      validate: generic.baseActions.createInputValidator,
      run: async () => {
        setError(null);
        setOutput("");

        const { executePhpWithTimeout, isSharedArrayBufferSupported } = await import(
          "@/services/php/phpExecutor"
        );

        if (!isSharedArrayBufferSupported()) {
          throw new Error(translate("messages.php.sharedArrayBufferUnsupported"));
        }

        const result = await executePhpWithTimeout(inputPhp);

        if (!result.ok) {
          partialOutput = result.error.output ?? "";
          throw new Error(result.error.message);
        }

        setOutput(result.value);
        return result.value;
      },
      toast,
      onSuccess: (printed) => {
        generic.endProcessing();
        // A silent script leaves the output empty (nothing to copy or count) and says so here.
        toast?.success(
          translate(printed ? "messages.php.executed" : "messages.php.executedNoOutput"),
        );
      },
      onError: (message) => {
        generic.endProcessing();
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
