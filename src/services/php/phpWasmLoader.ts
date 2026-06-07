/**
 * Lazy loader for @php-wasm/web
 * Loads the WASM runtime only when needed (not on page load)
 */

import { loadWebRuntime } from "@php-wasm/web";

type PHPVersion = "8.0" | "8.1" | "8.2" | "8.3" | "8.4" | "next";

// php-wasm returns PHP instance at runtime (typed as any internally)
type PhpRuntime = Parameters<typeof loadWebRuntime>[0] extends string ? unknown : unknown;

let cachedRuntime: PhpRuntime | null = null;
let loadingPromise: Promise<PhpRuntime> | null = null;

export type PhpWasmLoaderState = "idle" | "loading" | "ready" | "error";

interface PhpWasmLoader {
  state: PhpWasmLoaderState;
  runtime: PhpRuntime | null;
  error: string | null;
}

const loaderStatus: PhpWasmLoader = {
  state: "idle",
  runtime: null,
  error: null,
};

/**
 * Lazy load the PHP WASM runtime.
 * Call this before executing PHP code - it will load the ~15MB WASM lazily.
 *
 * @param phpVersion - PHP version to load (default: "8.2")
 * @returns Promise resolving to PHP instance
 */
export async function loadPhpWasm(
  phpVersion: PHPVersion = "8.2"
): Promise<PhpRuntime> {
  if (loaderStatus.state === "ready" && cachedRuntime) {
    return cachedRuntime;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loaderStatus.state = "loading";
  loaderStatus.error = null;

  loadingPromise = (async () => {
    try {
      // loadWebRuntime returns a PHP instance at runtime
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const runtime: any = await loadWebRuntime(phpVersion, {
        onPhpLoaderModuleLoaded: (module) => {
          console.debug("[php-wasm] Loader module loaded", module);
        },
      });

      cachedRuntime = runtime;
      loaderStatus.state = "ready";
      loaderStatus.runtime = cachedRuntime;
      loaderStatus.error = null;

      return cachedRuntime;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      loaderStatus.state = "error";
      loaderStatus.error = message;
      loadingPromise = null;
      throw new Error(`Failed to load php-wasm: ${message}`);
    }
  })();

  return loadingPromise;
}

/**
 * Get current loader status (for UI feedback)
 */
export function getPhpWasmLoaderStatus(): PhpWasmLoader {
  return { ...loaderStatus };
}

/**
 * Preload php-wasm in background (optional, for better UX)
 * Does not block - loads lazily on next call to loadPhpWasm
 */
export function preloadPhpWasm(phpVersion: PHPVersion = "8.2"): void {
  // Kick off loading in background without blocking
  loadPhpWasm(phpVersion).catch(() => {
    // Silently ignore preload errors
    // loadPhpWasm will throw on actual use
  });
}