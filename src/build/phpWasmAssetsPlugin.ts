import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import type { Plugin } from "vite";

/**
 * Serves the PHP 7.4 WebAssembly binaries SAME-ORIGIN.
 *
 * Why: php-wasm needs SharedArrayBuffer, which requires cross-origin isolation
 * (COOP + COEP `require-corp`). Under `require-corp`, every cross-origin
 * subresource must declare CORP — and the esm.sh CDN does not. Loading the
 * wasm from a CDN therefore gets blocked ("both async and sync fetching of the
 * wasm failed"). Same-origin resources are exempt from COEP, so we serve the
 * wasm from our own origin instead.
 *
 * The `@php-wasm/web-7-4` package ships two builds (asyncify + jspi); the active
 * one is chosen at runtime via feature detection, so we expose both. The runtime
 * points Emscripten's `locateFile` at these URLs.
 */

const PHP_WASM_PACKAGE = "@php-wasm/web-7-4";

/** Public URL → file path inside the installed package. */
const ASSETS = [
  { url: "php-wasm/7-4/asyncify/7_4_33/php_7_4.wasm", rel: "asyncify/7_4_33/php_7_4.wasm" },
  { url: "php-wasm/7-4/jspi/7_4_33/php_7_4.wasm", rel: "jspi/7_4_33/php_7_4.wasm" },
] as const;

function resolvePackageDir(): string {
  const require = createRequire(import.meta.url);
  return dirname(require.resolve(`${PHP_WASM_PACKAGE}/package.json`));
}

export function phpWasmAssets(): Plugin {
  let packageDir = "";

  const filePath = (rel: string) => join(packageDir, rel);

  return {
    name: "php-wasm-assets",
    buildStart() {
      packageDir = resolvePackageDir();
      for (const asset of ASSETS) {
        const path = filePath(asset.rel);
        if (!existsSync(path)) {
          this.error(
            `php-wasm asset not found: ${path}. Is ${PHP_WASM_PACKAGE} installed?`,
          );
        }
      }
    },
    // Dev: serve the wasm from node_modules at its public URL.
    configureServer(server) {
      packageDir = packageDir || resolvePackageDir();
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0]?.replace(/^\//, "");
        const asset = ASSETS.find((a) => a.url === url);
        if (!asset) {
          next();
          return;
        }
        res.setHeader("Content-Type", "application/wasm");
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        res.end(readFileSync(filePath(asset.rel)));
      });
    },
    // Build: emit the wasm into the output as same-origin assets.
    generateBundle() {
      for (const asset of ASSETS) {
        this.emitFile({
          type: "asset",
          fileName: asset.url,
          source: readFileSync(filePath(asset.rel)),
        });
      }
    },
  };
}
