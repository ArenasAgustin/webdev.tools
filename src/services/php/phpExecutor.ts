/**
 * PHP Executor - Client-side PHP execution via php-wasm
 */

import type { Result } from "@/types/common";

const PHP_EXECUTION_TIMEOUT_MS = 5000;

export type PhpExecResult = Result<string, { message: string }>;

export interface PhpExecRequest {
  code: string;
}

/** `started` is posted once the runtime is loaded, right before the code runs. */
export type PhpExecResponse = { type: "started" } | { type: "done"; result: PhpExecResult };

export interface PhpExecOptions {
  onStarted?: () => void;
}

/** PHP version we bundle the wasm binaries for. */
export const PHP_VERSION = "7.4";

/**
 * Execute PHP code client-side via php-wasm.
 *
 * Vite bundles the wasm as a same-origin hashed asset and sets the loader's
 * `dependencyFilename` to its absolute URL (e.g. "/assets/php_7_4-HASH.wasm").
 * We return that URL unchanged from `locateFile` so Emscripten fetches it
 * same-origin — cross-origin loads from a CDN are blocked by COEP `require-corp`.
 */
export async function executePhp(
  code: string,
  options: PhpExecOptions = {},
): Promise<PhpExecResult> {
  try {
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const { loadWebRuntime } = (await import("@php-wasm/web")) as any;
    const { PHP } = (await import("@php-wasm/universal")) as any;
    const runtimeId = await loadWebRuntime(PHP_VERSION, {
      emscriptenOptions: {
        locateFile: (filePath: string) => filePath,
      },
    });
    const php = new PHP(runtimeId);
    const trimmed = code.trim();
    const phpCode = trimmed.startsWith("<?") ? trimmed : `<?php\n${trimmed}`;
    options.onStarted?.();
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
 * Execute PHP code in a dedicated worker with a timeout.
 *
 * php-wasm runs synchronously, so an infinite loop on the main thread would
 * freeze the tab and a timer could never fire. The worker is terminated when
 * the run exceeds `timeoutMs`. The timer starts once the runtime is loaded,
 * so the wasm download/compile does not count against the user's code.
 */
export function executePhpWithTimeout(
  code: string,
  timeoutMs: number = PHP_EXECUTION_TIMEOUT_MS,
): Promise<PhpExecResult> {
  return new Promise((resolve) => {
    const worker = new Worker(new URL("../../workers/phpExecWorker.ts", import.meta.url), {
      type: "module",
    });
    let timer: ReturnType<typeof setTimeout> | undefined;

    const finish = (result: PhpExecResult) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(result);
    };

    worker.onmessage = (event: MessageEvent<PhpExecResponse>) => {
      if (event.data.type === "started") {
        timer = setTimeout(() => {
          finish({
            ok: false,
            error: { message: `La ejecución superó ${timeoutMs / 1000} segundos y fue cancelada` },
          });
        }, timeoutMs);
        return;
      }
      finish(event.data.result);
    };

    worker.onerror = (event: ErrorEvent) => {
      event.preventDefault();
      finish({ ok: false, error: { message: event.message || "PHP worker failed" } });
    };

    worker.postMessage({ code } satisfies PhpExecRequest);
  });
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
