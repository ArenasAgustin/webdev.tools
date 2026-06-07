/**
 * PHP Executor - Client-side PHP execution via php-wasm
 */

import type { Result } from "@/types/common";
import { loadWebRuntime } from "@php-wasm/web";

const PHP_EXECUTION_TIMEOUT_MS = 5000;

// PHP class from @php-wasm/universal - use any to avoid type resolution issues
type PHPInstance = Awaited<ReturnType<typeof loadWebRuntime>>;

const cachedPHP: PHPInstance | null = null;
let loadingPromise: Promise<PHPInstance> | null = null;

/**
 * Get or create a PHP instance
 */
async function getPHP(): Promise<PHPInstance> {
  if (cachedPHP) return cachedPHP;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const runtimeId = await loadWebRuntime("8.2");
    // runtimeId is the PHP instance when using @php-wasm/web
    // The loadWebRuntime returns a PHP instance directly in web context
    return runtimeId as unknown as PHPInstance;
  })();

  return loadingPromise;
}

interface PhpResponse {
  bytes: Uint8Array;
  errors: string;
  exitCode: number;
}

/**
 * Execute PHP code client-side via php-wasm
 */
export async function executePhp(code: string): Promise<Result<string, { message: string }>> {
  try {
    const php = await getPHP();

    // Execute PHP code directly (uses zend_eval_string internally)
     
    const response = await (php.run as (opts: { code: string }) => Promise<PhpResponse>)({
      code: `<?php ${code}`,
    });

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