import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  root: ".",
  plugins: [
    react({
      include: [],
    }),
    nodePolyfills(),
  ],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      exclude: [
        "src/**/*.stories.tsx",
        "src/**/*.config.ts",
        "src/**/*.config.js",
        "src/main.tsx",
        "src/App.tsx",
        "src/workers/*.ts",
        "src/types/*.ts",
        "src/i18n/**/*.ts",
        "src/pages/**/*.tsx",
        "e2e/**",
        "scripts/**",
        "eslint.config.js",
        "tailwind.config.ts",
        "postcss.config.js",
        "tailwind.config.js",
        "vite.config.ts",
        "vitest.config.ts",
        "vitest.setup.ts",
        "src/test/**",
        "src/test-utils/**",
        "**/index.ts",
        "**/worker.types.ts",
        "**/dist/**",
        "**/preview.ts",
        "**/preview.tsx",
        "**/main.ts",
        "**/types.ts",
        "**/CodeEditor.tsx",
        "**/services/worker/**",
        "**/*constants.ts",
        "**/colors.ts",
        "**/vitest.setup.ts",
      ],
      thresholds: {
        lines: 90,
        functions: 84,
        branches: 88,
        statements: 90,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
