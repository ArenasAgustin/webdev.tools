/**
 * PHP Executor - Client-side PHP execution via php-wasm
 */

import type { Result } from "@/types/common";

const PHP_EXECUTION_TIMEOUT_MS = 5000;

/**
 * Execute PHP code client-side via php-wasm
 */
export async function executePhp(code: string): Promise<Result<string, { message: string }>> {
  try {
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const { loadWebRuntime } = (await import("@php-wasm/web")) as any;
    const { PHP } = (await import("@php-wasm/universal")) as any;
    const runtimeId = await loadWebRuntime("8.2");
    const php = new PHP(runtimeId);
    const trimmed = code.trim();
    const phpCode = trimmed.startsWith("<?") ? trimmed : `<?php\n${trimmed}`;
    const response = await php.run({ code: phpCode });
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    const output: string = (response as { text?: string }).text ?? "";
    const stderr: string = (response as { errors?: string }).errors ?? "";

    if (!output && stderr) {
      return { ok: false, error: { message: stderr } };
    }

    return { ok: true, value: output || "(sin salida)" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: { message } };
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
    return typeof SharedArrayBuffer !== "undefined" && window.crossOriginIsolated === true;
  } catch {
    return false;
  }
}
