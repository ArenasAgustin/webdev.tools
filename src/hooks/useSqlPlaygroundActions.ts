import { useState, useCallback } from "react";
import { sqlPlaygroundConfig } from "@/playgrounds/sql/sql.config";
import { executeSqlAsync, resetSqlAsync, formatSqlAsync, minifySqlAsync } from "@/services/sql/worker";
import {
  useGenericPlaygroundActions,
  type PlaygroundFileConfig,
} from "./useGenericPlaygroundActions";
import type { ToastApi } from "./usePlaygroundActions";
import type { SqlFormatConfig, SqlMinifyConfig, SqlExecuteResult } from "@/types/sql";

const FILE_CONFIG: PlaygroundFileConfig = {
  inputFileName: "query.sql",
  outputFileName: "result.json",
  mimeType: "application/sql",
  language: "SQL",
  acceptExtensions: ".sql",
};

async function formatRunner(input: string, config: SqlFormatConfig): Promise<string> {
  const result = await formatSqlAsync(input, config);
  if (!result.ok) throw new Error(result.error ?? "Error al formatear SQL");
  return result.value;
}

async function minifyRunner(input: string): Promise<string> {
  const result = await minifySqlAsync(input);
  if (!result.ok) throw new Error(result.error ?? "Error al minificar SQL");
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

  const handleExecute = useCallback(() => {
    if (!inputSql.trim()) {
      toast?.error("No hay SQL para ejecutar");
      return;
    }
    if (inputTooLarge) {
      toast?.error(inputTooLargeMessage ?? "El contenido es demasiado grande para procesarlo.");
      return;
    }

    setIsExecuting(true);
    setError(null);

    void executeSqlAsync(inputSql)
      .then((result: { ok: true; value: SqlExecuteResult } | { ok: false; error: string }) => {
        setIsExecuting(false);
        setIsFirstRun(false);
        if (result.ok) {
          setOutput(JSON.stringify(result.value, null, 2));
          toast?.success("Consulta ejecutada correctamente");
        } else {
          setError(result.error);
          toast?.error(result.error);
        }
      })
      .catch((err: unknown) => {
        setIsExecuting(false);
        setIsFirstRun(false);
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        toast?.error(message);
      });
  }, [inputSql, inputTooLarge, inputTooLargeMessage, setError, setOutput, toast]);

  const handleReset = useCallback(() => {
    void resetSqlAsync()
      .then(() => {
        setOutput("");
        setError(null);
        setIsFirstRun(true);
        toast?.success("Base de datos reseteada");
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        toast?.error(message);
      });
  }, [setError, setOutput, toast]);

  return {
    ...generic,
    handleExecute,
    handleReset,
    isExecuting,
    isFirstRun,
    isProcessing: generic.isProcessing || isExecuting,
  };
}
