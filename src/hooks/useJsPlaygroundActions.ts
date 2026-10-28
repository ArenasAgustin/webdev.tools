import { jsFileSettings, jsPlaygroundConfig } from "@/playgrounds/js/js.config";
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
import type { JsExecRequest, JsExecResponse, JsRunResult } from "@/services/js/execute";
import { MAX_OUTPUT_CHARS, MAX_OUTPUT_LINES } from "@/services/js/execute";
import { translate } from "@/i18n/translate";
import { localizeServiceMessage } from "@/services/localizeServiceMessage";

const JS_EXEC_TIMEOUT_MS = 5000;

const FILE_CONFIG: PlaygroundFileConfig = {
  ...jsFileSettings,
  // Getter so the translated name is resolved each time a message is built.
  get language() {
    return translate("messages.js.languageName");
  },
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
    // Ignore a second trigger while a run is in flight: its result could overwrite a newer one.
    if (!generic.beginProcessing()) return;
    // Clear before validating: a rejected input must not leave the previous result on screen.
    // Output printed before a runtime failure is set again in `run` below.
    setOutput("");
    createValidatedHandler({
      validate: generic.baseActions.createInputValidator,
      run: async () => {
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
        generic.endProcessing();
      },
      onError: (message) => {
        generic.endProcessing();
        setError(message);
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

/** End output that hit the runner's limit with a note saying it was cut. */
function withTruncationNote(output: string, truncated: boolean): string {
  if (!truncated) return output;
  const note = translate("messages.js.outputTruncated", {
    lines: MAX_OUTPUT_LINES,
    chars: MAX_OUTPUT_CHARS,
  });
  return output ? `${output}\n${note}` : note;
}

function toExecutionError(result: JsRunResult): JsExecutionError {
  return new JsExecutionError(
    result.error ? localizeServiceMessage(result.error) : translate("messages.js.unknownError"),
    withTruncationNote(result.output, result.truncated ?? false),
  );
}

async function executeJavaScript(code: string, timeoutMs: number): Promise<string> {
  // Without a Worker the code would run on the page itself: no timeout could stop an
  // endless loop and it would reach the page's storage. Refuse instead.
  if (typeof Worker === "undefined") {
    throw new JsExecutionError(translate("messages.js.workerUnsupported"), "");
  }
  return new Promise((resolve, reject) => {
    let settled = false;
    let truncated = false;
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
            withTruncationNote(logs.join("\n"), truncated),
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
      if (message.type === "truncated") {
        truncated = true;
        return;
      }
      const { result } = message;
      settle(() =>
        result.ok
          ? resolve(withTruncationNote(result.output, result.truncated ?? false))
          : reject(toExecutionError(result)),
      );
    };
    worker.onerror = (event: ErrorEvent) => {
      settle(() =>
        reject(
          new JsExecutionError(
            event.message || translate("messages.js.workerError"),
            withTruncationNote(logs.join("\n"), truncated),
          ),
        ),
      );
    };
    worker.postMessage({ code } satisfies JsExecRequest);
  });
}
