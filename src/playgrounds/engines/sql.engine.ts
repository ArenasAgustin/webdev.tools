import type { ReactNode } from "react";
import type { BaseActionsParams, OutputPanelProps } from "./types";
import { useSqlParser } from "@/hooks/useSqlParser";
import type { ValidationState } from "@/hooks/useAsyncValidator";
import { useSqlPlaygroundActions } from "@/hooks/useSqlPlaygroundActions";
import { DEFAULT_SQL_FORMAT_CONFIG } from "@/types/sql";
import { loadSqlToolsConfig, loadLastSql, saveLastSql } from "@/services/storage";
import { sqlPlaygroundConfig } from "../sql/sql.config";
import { formatSqlAsync, minifySqlAsync } from "@/services/sql/worker";
import type { SqlFormatConfig, SqlMinifyConfig } from "@/types/sql";
import { SqlOutputPanel } from "../sql/SqlOutputPanel";

/**
 * Map generic params to SQL-specific params
 */
function mapToSqlParams(params: BaseActionsParams) {
  return {
    inputSql: params.input,
    setInputSql: params.setInput,
    output: params.output,
    setOutput: params.setOutput,
    setError: params.setError,
    formatConfig: params.formatConfig as SqlFormatConfig,
    minifyConfig: params.minifyConfig as SqlMinifyConfig,
    inputTooLarge: params.inputTooLarge,
    inputTooLargeMessage: params.inputTooLargeMessage,
    toast: params.toast,
  };
}

/**
 * Adapter: converts SqlParserState → ValidationState for GenericPlayground compatibility.
 */
function useSqlParserAdapter(input: string): ValidationState {
  const { valid, error } = useSqlParser(input);
  return {
    isValid: valid,
    error: error !== null ? { message: error } : null,
  };
}

/**
 * SQL Playground Engine Configuration
 */
export const sqlEngine = {
  id: "sql",
  config: sqlPlaygroundConfig,
  editorLanguage: "sql" as const,
  features: ["validate", "minify", "execute"] as const,
  defaultFormatConfig: DEFAULT_SQL_FORMAT_CONFIG,
  defaultMinifyConfig: { autoCopy: false },
  loadToolsConfig: loadSqlToolsConfig,
  loadLastInput: loadLastSql,
  saveLastInput: saveLastSql,
  hasConfigModal: true,
  preload: () => {
    void import("@/services/sql/transform");
    void import("@/services/sql/workerClient");
  },
  useParser: useSqlParserAdapter,
  useActions: useSqlPlaygroundActions,
  mapActionsParams: mapToSqlParams,
  renderOutputPanel: SqlOutputPanel as (props: OutputPanelProps) => ReactNode,
  fileConfig: {
    inputFileName: "query.sql",
    outputFileName: "result.json",
    mimeType: "application/sql",
    language: "SQL",
    acceptExtensions: ".sql",
    exampleContent: sqlPlaygroundConfig.example,
    formatRunner: formatSqlAsync,
    minifyRunner: minifySqlAsync,
  },
};

// Type export for use
export type SqlEngine = typeof sqlEngine;
