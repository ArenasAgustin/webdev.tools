export type PhpWasmMode = "asyncify" | "jspi";

/**
 * Builds the same-origin URL where the PHP 7.4 wasm binary is served (see the
 * `php-wasm-assets` Vite plugin). Returns `null` for non-wasm files so the
 * default Emscripten loader handles them.
 *
 * @param mode      Active php-wasm build (asyncify or jspi).
 * @param filePath  The path Emscripten asks `locateFile` for (e.g. "7_4_33/php_7_4.wasm").
 * @param origin    The page origin (defaults handled by the caller).
 */
export function phpWasmLocateFile(
  mode: PhpWasmMode,
  filePath: string,
  origin: string,
): string | null {
  if (!filePath.endsWith(".wasm")) {
    return null;
  }
  const base = origin.replace(/\/$/, "");
  return `${base}/php-wasm/7-4/${mode}/${filePath}`;
}
