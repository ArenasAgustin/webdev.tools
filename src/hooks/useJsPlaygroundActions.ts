import { jsPlaygroundConfig } from "@/playgrounds/js/js.config";
import { jsService } from "@/services/js/service";
import { createValidatedHandler } from "@/utils/handlerFactory";
import { createTransformHandler } from "@/utils/createTransformHandler";
import {
  useGenericPlaygroundActions,
  type PlaygroundFileConfig,
} from "./useGenericPlaygroundActions";
import type { ToastApi } from "./usePlaygroundActions";
import type { JsFormatConfig, JsMinifyConfig, JsCleanConfig } from "@/types/js";
import { cleanJsAsync } from "@/services/js/worker";
import { runJavaScript } from "@/services/js/execute";
import type { JsExecRequest, JsExecResponse, JsRunResult } from "@/services/js/execute";
import { translate } from "@/i18n/translate";

const JS_EXEC_TIMEOUT_MS = 5000;

const FILE_CONFIG: PlaygroundFileConfig = {
  inputFileName: "code.js",
  outputFileName: "output.txt",
  mimeType: "application/javascript",
  // Getter so the translated name is resolved each time a message is built.
  get language() {
    return translate("messages.js.languageName");
  },
  acceptExtensions: ".js,.ts,.mjs,.mts",
};

async function formatRunner(input: string, config: JsFormatConfig) {
  const result = await jsService.format(input, { indentSize: config.indentSize });
  if (!result.ok) throw new Error(result.error ?? translate("messages.formatCodeError"));
  return result.value;
}

async function minifyRunner(input: string, config: JsMinifyConfig) {
  const result = await jsService.minify(input, {
    removeComments: config.removeComments,
    removeSpaces: config.removeSpaces,
  });
  if (!result.ok) throw new Error(result.error ?? translate("messages.minifyCodeError"));
  return result.value;
}

interface UseJsPlaygroundActionsProps {
  inputJs: string;
  setInputJs: (value: string) => void;
  output: string;
  setOutput: (value: string) => void;
  setError: (error: string | null) => void;
  inputTooLarge?: boolean;
  inputTooLargeMessage?: string;
  formatConfig: JsFormatConfig;
  minifyConfig: JsMinifyConfig;
  cleanConfig: JsCleanConfig;
  toast?: ToastApi;
}

export function useJsPlaygroundActions({
  inputJs,
  setInputJs,
  output,
  setOutput,
  setError,
  inputTooLarge,
  inputTooLargeMessage,
  formatConfig,
  minifyConfig,
  cleanConfig,
  toast,
}: UseJsPlaygroundActionsProps) {
  const generic = useGenericPlaygroundActions({
    input: inputJs,
    setInput: setInputJs,
    output,
    setOutput,
    setError,
    inputTooLarge,
    inputTooLargeMessage,
    formatConfig,
    minifyConfig,
    toast,
    exampleContent: jsPlaygroundConfig.example,
    fileConfig: FILE_CONFIG,
    formatRunner,
    minifyRunner,
  });

  // Extensión: ejecutar código JS
  const handleExecute = () => {
    // Clear before validating: a rejected input must not leave the previous result on screen.
    // Output printed before a runtime failure is set again in `run` below.
    setOutput("");
    createValidatedHandler({
      validate: generic.baseActions.createInputValidator,
      run: async () => {
        generic.setIsProcessing(true);
        setError(null);
        setOutput("");

        try {
          setOutput(await executeJavaScript(inputJs, JS_EXEC_TIMEOUT_MS));
        } catch (error) {
          // Keep whatever the code printed before failing or timing out.
          if (error instanceof JsExecutionError) setOutput(error.output);
          throw error;
        }
      },
      toast,
      successMessage: translate("messages.js.executed"),
      onSuccess: () => {
        generic.setIsProcessing(false);
      },
      onError: (message) => {
        generic.setIsProcessing(false);
        setError(message.replace(/^Error:\s*/, ""));
      },
    })();
  };

  // Extensión: limpiar código JS
  const handleClean = () => {
    createTransformHandler({
      runTransformAction: generic.runTransformAction,
      run: async () => {
        const result = await cleanJsAsync(inputJs, {
          removeEmptyObject: cleanConfig.removeEmptyObject,
          removeEmptyArray: cleanConfig.removeEmptyArray,
          removeEmptyFunction: cleanConfig.removeEmptyFunction,
          removeEmptyString: cleanConfig.removeEmptyString,
        });
        if (!result.ok) throw new Error(result.error.message);
        if (!result.value.trim()) throw new Error(translate("messages.js.cleanEmpty"));
        return result.value;
      },
      setOutput,
      setError,
      autoCopy: cleanConfig.autoCopy,
      successMessage: translate("messages.cleaned", { language: FILE_CONFIG.language }),
      errorMessage: translate("messages.js.cleanError"),
    });
  };

  return {
    ...generic,
    handleExecute,
    handleClean,
  };
}

/** Execution failure that carries the output printed before it failed. */
class JsExecutionError extends Error {
  readonly output: string;

  constructor(message: string, output: string) {
    super(message);
    this.output = output;
  }
}

function toExecutionError(result: JsRunResult): JsExecutionError {
  return new JsExecutionError(
    result.error ?? translate("messages.js.unknownError"),
    result.output,
  );
}

async function executeJavaScript(code: string, timeoutMs: number): Promise<string> {
  if (typeof Worker === "undefined") {
    const result = await runJavaScript(code);
    if (!result.ok) throw toExecutionError(result);
    return result.output;
  }
  return new Promise((resolve, reject) => {
    let settled = false;
    const logs: string[] = [];
    const worker = new Worker(new URL("../workers/jsExecWorker.ts", import.meta.url), {
      type: "module",
    });
    const settle = (finish: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      worker.terminate();
      finish();
    };
    const timeout = window.setTimeout(() => {
      settle(() =>
        reject(
          new JsExecutionError(
            translate("messages.js.timeout", { seconds: timeoutMs / 1000 }),
            logs.join("\n"),
          ),
        ),
      );
    }, timeoutMs);
    worker.onmessage = (event: MessageEvent<JsExecResponse>) => {
      const message = event.data;
      if (message.type === "log") {
        logs.push(message.line);
        return;
      }
      const { result } = message;
      settle(() => (result.ok ? resolve(result.output) : reject(toExecutionError(result))));
    };
    worker.onerror = (event: ErrorEvent) => {
      settle(() =>
        reject(
          new JsExecutionError(event.message || translate("messages.js.workerError"), logs.join("\n")),
        ),
      );
    };
    worker.postMessage({ code } satisfies JsExecRequest);
  });
}
