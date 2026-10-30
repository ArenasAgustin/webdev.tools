/**
 * SQL Worker facade — async functions for the main thread.
 * All operations delegate to sqlWorkerAdapter (singleton worker); error keys
 * coming back from the worker are localized here.
 */

import type { Result } from "@/types/common";
import type { SqlExecuteResult, SqlFormatConfig } from "@/types/sql";
import { sqlWorkerAdapter } from "@/services/sql/workerClient";
import { localizeServiceMessage } from "@/services/localizeServiceMessage";
import { WorkerTimeoutError } from "@/services/worker/clientFactory";
import { translate } from "@/i18n/translate";

/**
 * Time a query may run before its worker is terminated and replaced. sql.js
 * runs synchronously in the worker, so a runaway query (e.g. an unbounded
 * recursive CTE) can only be stopped this way, and the in-memory database is
 * lost with it.
 */
export const SQL_EXECUTION_TIMEOUT_MS = 10_000;

export const formatSqlAsync = async (
  input: string,
  config: SqlFormatConfig = { dialect: "sql", tabWidth: 2 },
): Promise<Result<string, string>> => {
  try {
    const response = await sqlWorkerAdapter.run({ action: "format", input, options: config });
    if (response.ok) {
      return { ok: true, value: (response as { value: string }).value ?? "" };
    }
    const err = (response as { error?: { message?: string } }).error;
    return { ok: false, error: localizeServiceMessage(err?.message ?? "Format error") };
  } catch (err) {
    return { ok: false, error: localizeServiceMessage(err instanceof Error ? err.message : String(err)) };
  }
};

export const validateSqlAsync = async (
  input: string,
  config: SqlFormatConfig = { dialect: "sql", tabWidth: 2 },
): Promise<Result<true, string>> => {
  try {
    const response = await sqlWorkerAdapter.run({ action: "validate", input, options: config });
    if (response.ok) {
      return { ok: true, value: true };
    }
    const err = (response as { error?: { message?: string } }).error;
    return { ok: false, error: localizeServiceMessage(err?.message ?? "Validate error") };
  } catch (err) {
    return { ok: false, error: localizeServiceMessage(err instanceof Error ? err.message : String(err)) };
  }
};

export const minifySqlAsync = async (input: string): Promise<Result<string, string>> => {
  try {
    const response = await sqlWorkerAdapter.run({ action: "minify", input });
    if (response.ok) {
      return { ok: true, value: (response as { value: string }).value ?? "" };
    }
    const err = (response as { error?: { message?: string } }).error;
    return { ok: false, error: localizeServiceMessage(err?.message ?? "Minify error") };
  } catch (err) {
    return { ok: false, error: localizeServiceMessage(err instanceof Error ? err.message : String(err)) };
  }
};

/**
 * An execute outcome. `databaseReset` marks a failure that replaced the worker
 * (timeout or crash): the in-memory database is gone and the next run has to
 * load sql.js again.
 */
export type SqlExecuteOutcome = Result<SqlExecuteResult, string> & { databaseReset?: true };

export const executeSqlAsync = async (input: string): Promise<SqlExecuteOutcome> => {
  try {
    // Load sql.js first, under the client's default timeout, so the wasm
    // download and compile do not count against the query.
    const loaded = await sqlWorkerAdapter.run({ action: "load", input: "" });
    if (!loaded.ok) {
      const err = (loaded as { error?: { message?: string } }).error;
      return { ok: false, error: localizeServiceMessage(err?.message ?? "Execute error") };
    }
    const response = await sqlWorkerAdapter.run(
      { action: "execute", input },
      { timeoutMs: SQL_EXECUTION_TIMEOUT_MS },
    );
    if (response.ok && "action" in response && response.action === "execute") {
      return {
        ok: true,
        value: (response as { action: "execute"; value: SqlExecuteResult }).value,
      };
    }
    if (!response.ok) {
      const err = (response as { error?: { message?: string } }).error;
      return { ok: false, error: localizeServiceMessage(err?.message ?? "Execute error") };
    }
    return { ok: false, error: "Unexpected execute response" };
  } catch (err) {
    // The adapter only throws when the worker itself failed and was dropped.
    if (err instanceof WorkerTimeoutError) {
      return {
        ok: false,
        error: translate("services.sql.timeout", { seconds: SQL_EXECUTION_TIMEOUT_MS / 1000 }),
        databaseReset: true,
      };
    }
    return {
      ok: false,
      error: localizeServiceMessage(err instanceof Error ? err.message : String(err)),
      databaseReset: true,
    };
  }
};

export const resetSqlAsync = async (): Promise<Result<string, string>> => {
  try {
    const response = await sqlWorkerAdapter.run({ action: "reset", input: "" });
    if (response.ok) {
      return { ok: true, value: "reset" };
    }
    const err = (response as { error?: { message?: string } }).error;
    return { ok: false, error: localizeServiceMessage(err?.message ?? "Reset error") };
  } catch (err) {
    return { ok: false, error: localizeServiceMessage(err instanceof Error ? err.message : String(err)) };
  }
};
