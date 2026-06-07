/**
 * SQL Worker facade — async functions for the main thread.
 * All operations delegate to sqlWorkerAdapter (singleton worker).
 */

import type { Result } from "@/types/common";
import type { SqlExecuteResult, SqlFormatConfig } from "@/types/sql";
import { sqlWorkerAdapter } from "@/services/sql/workerClient";

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
    return { ok: false, error: err?.message ?? "Format error" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
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
    return { ok: false, error: err?.message ?? "Validate error" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
};

export const minifySqlAsync = async (input: string): Promise<Result<string, string>> => {
  try {
    const response = await sqlWorkerAdapter.run({ action: "minify", input });
    if (response.ok) {
      return { ok: true, value: (response as { value: string }).value ?? "" };
    }
    const err = (response as { error?: { message?: string } }).error;
    return { ok: false, error: err?.message ?? "Minify error" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
};

export const executeSqlAsync = async (
  input: string,
): Promise<Result<SqlExecuteResult, string>> => {
  try {
    const response = await sqlWorkerAdapter.run({ action: "execute", input });
    if (response.ok && "action" in response && response.action === "execute") {
      return {
        ok: true,
        value: (response as { action: "execute"; value: SqlExecuteResult }).value,
      };
    }
    if (!response.ok) {
      const err = (response as { error?: { message?: string } }).error;
      return { ok: false, error: err?.message ?? "Execute error" };
    }
    return { ok: false, error: "Unexpected execute response" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
};

export const resetSqlAsync = async (): Promise<Result<string, string>> => {
  try {
    const response = await sqlWorkerAdapter.run({ action: "reset", input: "" });
    if (response.ok) {
      return { ok: true, value: "reset" };
    }
    const err = (response as { error?: { message?: string } }).error;
    return { ok: false, error: err?.message ?? "Reset error" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
};
