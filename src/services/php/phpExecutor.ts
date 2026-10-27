/**
 * PHP Executor - Client-side PHP execution via php-wasm
 */

import type { PhpExecRequest, PhpExecResponse, PhpExecResult } from "@/services/php/phpRuntime";
import { PHP_NO_OUTPUT } from "@/services/php/phpRuntime";
import { translate } from "@/i18n/translate";
import { localizeServiceResult } from "@/services/localizeServiceMessage";

export { executePhp, PHP_VERSION } from "@/services/php/phpRuntime";
export type {
  PhpExecOptions,
  PhpExecRequest,
  PhpExecResponse,
  PhpExecResult,
} from "@/services/php/phpRuntime";

const PHP_EXECUTION_TIMEOUT_MS = 5000;

/** Turn the worker's locale-neutral messages into user-facing text. */
function localizeExecResult(result: PhpExecResult): PhpExecResult {
  if (result.ok) {
    return result.value === PHP_NO_OUTPUT
      ? { ok: true, value: translate("services.php.noOutput") }
      : result;
  }
  return localizeServiceResult(result);
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
      resolve(localizeExecResult(result));
    };

    worker.onmessage = (event: MessageEvent<PhpExecResponse>) => {
      if (event.data.type === "started") {
        timer = setTimeout(() => {
          finish({
            ok: false,
            error: {
              message: translate("services.php.timeout", { seconds: timeoutMs / 1000 }),
            },
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
