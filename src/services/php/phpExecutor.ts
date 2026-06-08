/**
 * PHP Executor - Client-side PHP execution via php-wasm
 */

import type { Result } from "@/types/common";

const PHP_EXECUTION_TIMEOUT_MS = 5000;

interface PhpResponse {
  bytes: ArrayBuffer;
  errors: string;
  exitCode: number;
}

type PhpRunFunction = (opts: { code: string }) => Promise<PhpResponse>;

/**
 * Execute PHP code client-side via php-wasm
 */
export async function executePhp(code: string): Promise<Result<string, { message: string }>> {
  try {
    const { loadWebRuntime } = await import("@php-wasm/web");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const php: any = await loadWebRuntime("8.2");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const run: PhpRunFunction = php.run as PhpRunFunction;

    const response = await run({ code: `<?php ${code}` });

    const output = new TextDecoder().decode(response.bytes);
    const stderr = response.errors;

    if (response.exitCode !== 0) {
      return {
        ok: false,
        error: {
          message: stderr ?? `PHP exited con código ${response.exitCode}`,
        },
      };
    }

    return {
      ok: true,
      value: output || "(sin salida)",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      error: { message },
    };
  }
}

/**
 * Execute PHP code with timeout
 */
export async function executePhpWithTimeout(
  code: string,
  timeoutMs: number = PHP_EXECUTION_TIMEOUT_MS
): Promise<Result<string, { message: string }>> {
  return Promise.race([
    executePhp(code),
    new Promise<Result<string, { message: string }>>((resolve) =>
      setTimeout(() => {
        resolve({
          ok: false,
          error: { message: `La ejecución superó ${timeoutMs / 1000} segundos y fue cancelada` },
        });
      }, timeoutMs)
    ),
  ]);
}

/**
 * Check if SharedArrayBuffer is available (required for php-wasm)
 */
export function isSharedArrayBufferSupported(): boolean {
  try {
    return typeof SharedArrayBuffer !== "undefined";
  } catch {
    return false;
  }
}