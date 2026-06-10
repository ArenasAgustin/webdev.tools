import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import wasm from "vite-plugin-wasm";
import { phpWasmAssets } from "./src/build/phpWasmAssetsPlugin";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  test: {
    globals: true,
    environment: "ssr", // Entorno SSR para compatibilidad con el resto de los tests
    setupFiles: "./vitest.setup.ts", // Archivo de setup para mocks globales
    pool: 'forks', // Usar forks para evitar problemas de memoria
    poolOptions: {
      forks: {
        maxForks: 1, // Limitar a 1 worker para evitar errores de memoria
      },
    },
  },
  plugins: [
    {
      name: "php-wasm-as-url",
      enforce: "pre" as const,
      resolveId(id: string, importer: string | undefined) {
        if (id.endsWith(".wasm") && !id.includes("?") && importer?.includes("@php-wasm")) {
          if (id.startsWith(".") && importer) {
            // Bypass vite-plugin-wasm by resolving directly — this.resolve() would
            // delegate to vite-plugin-wasm which returns a virtual \0 ID, then
            // appending ?url to that virtual ID causes a 500.
            return path.resolve(path.dirname(importer), id) + "?url";
          }
        }
      },
    },
    wasm(),
    phpWasmAssets(),
    react(),
    nodePolyfills(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      manifest: false,
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        cleanupOutdatedCaches: true,
        // Auto-activate a new SW without waiting for a client SKIP_WAITING message.
        // Without this, a fresh SW can stay stuck in "waiting" while a stale SW keeps
        // serving the old precached index.html (and its broken chunks) forever.
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /cdnjs\.cloudflare\.com/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "cdn-assets",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /fonts\.googleapis\.com|fonts\.gstatic\.com/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/(api|_)/],
      },
    }),
    visualizer({
      open: process.env.npm_lifecycle_event === "analyze",
      gzipSize: true,
      brotliSize: true,
      filename: "dist/stats.html",
    }) as never,
  ],
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  resolve: {
    alias: {
      "ini": path.resolve(__dirname, "./src/shims/ini.js"),
      // pnpm strict mode doesn't hoist transitive deps — alias to .pnpm path directly
      "@php-wasm/universal": path.resolve(
        __dirname,
        "./node_modules/.pnpm/@php-wasm+universal@3.1.36/node_modules/@php-wasm/universal"
      ),
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/services": path.resolve(__dirname, "./src/services"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/types": path.resolve(__dirname, "./src/types"),
      "@/utils": path.resolve(__dirname, "./src/utils"),
      "@/playgrounds": path.resolve(__dirname, "./src/playgrounds"),
    },
  },
  define: {
    // Polyfill for php-parser and other Node.js-dependent libraries
    "process.env.NODE_ENV": JSON.stringify(mode === "production" ? "production" : "development"),
    "process.argv": "[]",
    "process.platform": JSON.stringify("browser"),
    "process.version": JSON.stringify(""),
  },
  // .dat = php-wasm ICU data (binary); treat as asset so Rollup doesn't parse it as JS
  assetsInclude: ["**/*.wasm", "**/*.dat"],
  optimizeDeps: {
    exclude: ["@php-wasm/web", "@php-wasm/universal", "@php-wasm/web-7-4"],
  },
  worker: {
    format: "es",
  },
  build: {
    target: "esnext",
    rollupOptions: {
      external: [
        // php-wasm is bundled and served same-origin (see phpWasmAssets plugin).
        // Only the synthetic emscripten "env" import stays external.
        "env",
      ],
      output: {
        manualChunks: (id) => {
          if (id.includes("@monaco-editor/react")) return "monaco";
          if (id.includes("node_modules/react-router")) return "router";
          if (
            id.includes("node_modules/i18next") ||
            id.includes("node_modules/react-i18next") ||
            id.includes("node_modules/i18next-browser-languagedetector")
          )
            return "i18n";
          if (
            id.includes("node_modules/sql-formatter") ||
            id.includes("node_modules/sql.js")
          )
            return "sql";
          if (id.includes("node_modules/react") || id.includes("node_modules/scheduler"))
            return "vendor";
        },
      },
    },
  },
}));
