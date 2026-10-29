/**
 * PHP runtime - executes PHP code via php-wasm.
 *
 * Runs inside the PHP exec worker, so it must not import i18next: messages are
 * locale-neutral `services.*` keys localized by `executePhpWithTimeout`.
 */

import type { Result } from "@/types/common";
import { serviceMessage } from "@/services/serviceMessage";

/** `output` holds what the script printed before a fatal error. */
export type PhpExecResult = Result<string, { message: string; output?: string }>;

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
 * php-wasm's default php.ini prints errors as HTML and also logs them to stderr.
 * Print them as plain text, once, in order with the script's output.
 */
const PHP_INI_ENTRIES = { html_errors: "0", log_errors: "0" };

/**
 * A fatal or parse error ends the script: report its first line as the error
 * and keep whatever the script printed before it. Any other non-zero exit
 * (`exit(1)`) keeps the whole output and reports the exit code.
 */
function toFailure(text: string, exitCode: number | undefined): PhpExecResult {
  const match = /(^|\n)((?:Fatal|Parse) error: [^\n]*)/.exec(text);
  if (!match) {
    const message = serviceMessage("services.php.exitCode", { code: exitCode ?? "?" });
    return { ok: false, error: text ? { message, output: text } : { message } };
  }
  const output = text.slice(0, match.index);
  return { ok: false, error: output ? { message: match[2], output } : { message: match[2] } };
}

/** Drop php-wasm's internal script path from PHP error messages. */
function stripInternalPaths(text: string): string {
  return text
    .replace(/ in \/internal\/\S+?\.php:(\d+)/g, " on line $1")
    .replace(/ in \/internal\/\S+?\.php on line/g, " on line");
}

/**
 * Execute PHP code client-side via php-wasm.
 *
 * Vite bundles the wasm as a same-origin hashed asset and sets the loader's
 * `dependencyFilename` to its absolute URL (e.g. "/assets/php_7_4-HASH.wasm").
 * We return that URL unchanged from `locateFile` so Emscripten fetches it
 * same-origin — cross-origin loads from a CDN would need CORS under COEP.
 */
export async function executePhp(
  code: string,
  options: PhpExecOptions = {},
): Promise<PhpExecResult> {
  try {
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const { loadWebRuntime } = (await import("@php-wasm/web")) as any;
    const { PHP, setPhpIniEntries } = (await import("@php-wasm/universal")) as any;
    const runtimeId = await loadWebRuntime(PHP_VERSION, {
      emscriptenOptions: {
        locateFile: (filePath: string) => filePath,
      },
    });
    const php = new PHP(runtimeId);
    await setPhpIniEntries(php, PHP_INI_ENTRIES);
    const trimmed = code.trim();
    // Code with an open tag anywhere (e.g. inline HTML first) runs as written.
    // Tagless code gets one on its first line so error line numbers still match.
    const phpCode = /<\?(php\b|=)/i.test(trimmed) ? trimmed : `<?php ${trimmed}`;
    options.onStarted?.();
    const response = await php.run({ code: phpCode });
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    const output = stripInternalPaths((response as { text?: string }).text ?? "");
    const stderr: string = (response as { errors?: string }).errors ?? "";

    if (!output && stderr) {
      return { ok: false, error: { message: stderr } };
    }

    // An empty string means the script printed nothing; the UI says so in its toast.
    return { ok: true, value: output };
  } catch (error) {
    // php-wasm throws on a non-zero exit code; the error carries the response.
    const failed = (error as { response?: { text?: string; exitCode?: number } } | null)?.response;
    if (failed) return toFailure(stripInternalPaths(failed.text ?? ""), failed.exitCode);
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: { message } };
  }
}
