import { useState, useCallback } from "react";
import { sqlFileSettings, sqlPlaygroundConfig } from "@/playgrounds/sql/sql.config";
import {
  executeSqlAsync,
  type SqlExecuteOutcome,
  resetSqlAsync,
  formatSqlAsync,
  minifySqlAsync,
} from "@/services/sql/worker";
import {
  useGenericPlaygroundActions,
  type PlaygroundFileConfig,
} from "./useGenericPlaygroundActions";
import { compactTransformError } from "@/utils/transformError";
import { translate } from "@/i18n/translate";
import type { ToastApi } from "./usePlaygroundActions";
import type { SqlFormatConfig, SqlMinifyConfig } from "@/types/sql";

const FILE_CONFIG: PlaygroundFileConfig = {
  ...sqlFileSettings,
  language: "SQL",
};

/**
 * The output holds either an execution result (JSON) or formatted/minified SQL.
 * Name and type the download after what is actually there, the same way the
 * output panel picks its editor language.
 */
function outputDownloadFile(output: string): { fileName: string; mimeType: string } {
  try {
    JSON.parse(output);
    return { fileName: "output.json", mimeType: "application/json" };
  } catch {
    return { fileName: "output.sql", mimeType: FILE_CONFIG.mimeType };
  }
}

/** Formats through the worker and unwraps its result; shared with the SQL engine. */
export async function formatRunner(input: string, config: SqlFormatConfig): Promise<string> {
  const result = await formatSqlAsync(input, config);
  if (!result.ok) throw new Error(result.error ?? translate("messages.formatError", { language: FILE_CONFIG.language }));
  return result.value;
}

/** Minifies through the worker and unwraps its result; shared with the SQL engine. */
export async function minifyRunner(input: string): Promise<string> {
  const result = await minifySqlAsync(input);
  if (!result.ok) throw new Error(result.error ?? translate("messages.minifyError", { language: FILE_CONFIG.language }));
  return result.value;
}

export interface UseSqlPlaygroundActionsProps {
  inputSql: string;
  setInputSql: (value: string) => void;
  output: string;
  setOutput: (value: string) => void;
  setError: (error: string | null) => void;
  inputTooLarge?: boolean;
  inputTooLargeMessage?: string;
  formatConfig: SqlFormatConfig;
  minifyConfig: SqlMinifyConfig;
  toast?: ToastApi;
}

export function useSqlPlaygroundActions({
  inputSql,
  setInputSql,
  output,
  setOutput,
  setError,
  inputTooLarge,
  inputTooLargeMessage,
  formatConfig,
  minifyConfig,
  toast,
}: UseSqlPlaygroundActionsProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isFirstRun, setIsFirstRun] = useState(true);

  const generic = useGenericPlaygroundActions({
    input: inputSql,
    setInput: setInputSql,
    output,
    setOutput,
    setError,
    inputTooLarge,
    inputTooLargeMessage,
    formatConfig,
    minifyConfig,
    toast,
    exampleContent: sqlPlaygroundConfig.example,
    fileConfig: FILE_CONFIG,
    formatRunner,
    minifyRunner,
  });

  const { beginProcessing, endProcessing, baseActions } = generic;

  const handleDownloadOutput = useCallback(() => {
    const { fileName, mimeType } = outputDownloadFile(output);
    baseActions.handleDownload({
      content: output,
      fileName,
      mimeType,
      successMessage: translate("messages.downloadedAs", { fileName }),
      validate: () => (!output ? translate("messages.noOutputToDownload") : null),
    });
  }, [baseActions, output]);

  const handleExecute = useCallback(() => {
    // Ignore a second trigger (button or Ctrl+Shift+Enter) while a query is running:
    // a statement such as INSERT must not run twice.
    if (!beginProcessing()) return;
    if (!inputSql.trim()) {
      endProcessing();
      toast?.error(translate("messages.noInputToExecute", { language: FILE_CONFIG.language }));
      return;
    }
    if (inputTooLarge) {
      endProcessing();
      toast?.error(inputTooLargeMessage ?? translate("messages.inputTooLarge"));
      return;
    }

    setIsExecuting(true);
    setError(null);

    void executeSqlAsync(inputSql)
      .then((result: SqlExecuteOutcome) => {
        endProcessing();
        setIsExecuting(false);
        // A replaced worker lost sql.js too, so the next run loads it again.
        setIsFirstRun(result.databaseReset === true);
        if (result.ok) {
          setOutput(JSON.stringify(result.value, null, 2));
          toast?.success(translate("messages.sql.executed"));
        } else {
          // Drop the previous result so the error is not shown next to stale rows;
          // rows of the statements that ran before the failing one are kept.
          setOutput(result.partial ? JSON.stringify(result.partial, null, 2) : "");
          // The panel keeps the full parser message; the toast only gets its first line.
          setError(result.error);
          toast?.error(compactTransformError(result.error));
        }
      })
      .catch((err: unknown) => {
        endProcessing();
        setIsExecuting(false);
        setIsFirstRun(false);
        const message = err instanceof Error ? err.message : String(err);
        setOutput("");
        setError(message);
        toast?.error(compactTransformError(message));
      });
  }, [
    beginProcessing,
    endProcessing,
    inputSql,
    inputTooLarge,
    inputTooLargeMessage,
    setError,
    setOutput,
    toast,
  ]);

  const handleReset = useCallback(() => {
    void resetSqlAsync()
      .then((result) => {
        if (!result.ok) {
          toast?.error(result.error);
          return;
        }
        setOutput("");
        setError(null);
        setIsFirstRun(true);
        toast?.success(translate("messages.sql.reset"));
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        toast?.error(message);
      });
  }, [setError, setOutput, toast]);

  return {
    ...generic,
    handleDownloadOutput,
    handleExecute,
    handleReset,
    isExecuting,
    isFirstRun,
    isProcessing: generic.isProcessing,
  };
}
