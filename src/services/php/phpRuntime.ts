/**
 * PHP runtime - executes PHP code via php-wasm.
 *
 * Runs inside the PHP exec worker, so it must not import i18next: messages are
 * locale-neutral `services.*` keys localized by `executePhpWithTimeout`.
 */

import type { Result } from "@/types/common";
import { serviceMessage } from "@/services/serviceMessage";

export type PhpExecResult = Result<string, { message: string }>;

export interface PhpExecRequest {
  code: string;
}

/** `started` is posted once the runtime is loaded, right before the code runs. */
export type PhpExecResponse = { type: "started" } | { type: "done"; result: PhpExecResult };

export interface PhpExecOptions {
  onStarted?: () => void;
}

/** Output reported when the script prints nothing. */
export const PHP_NO_OUTPUT = serviceMessage("services.php.noOutput");

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

    return { ok: true, value: output || PHP_NO_OUTPUT };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: { message } };
  }
}
