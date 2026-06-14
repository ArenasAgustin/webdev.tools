// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import globals from "globals";
import eslintReact from "@eslint-react/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettierConfig from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig([
  globalIgnores(["dist", "node_modules", "coverage", "coverage2", "src/test-utils/**/*", "src/test/**/*"]),
  {
    files: ["**/*.{ts,tsx}"],
    ignores: [".storybook/**"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      eslintReact.configs["recommended-type-checked"],
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        projectService: {
          allowDefaultProject: ["tsconfig.json", "tsconfig.app.json", "tsconfig.node.json", "tsconfig.vitest.json"],
        },
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    files: [".storybook/**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      // recommended-typescript (not type-checked): .storybook block has no projectService — type-checked preset would crash
      eslintReact.configs["recommended-typescript"],
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  {
    files: ["**/*.{js,jsx}"],
    extends: [js.configs.recommended, eslintReact.configs["recommended"]],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/prefer-promise-reject-errors": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/unbound-method": "off",
    },
  },
  {
    files: ["src/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: false,
        },
      ],
      "@typescript-eslint/no-floating-promises": "off",
      // reason: GenericPlayground uses the accepted React pattern of resetting derived state in an
      // effect when input changes. Restructuring to avoid the effect would require lifting state or
      // using a key-reset, which is out of scope for this migration. Follow-up in a future PR.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    files: ["src/playgrounds/js/JsPlayground.tsx", "src/hooks/useJsPlaygroundActions.ts"],
    rules: {
      "@typescript-eslint/no-implied-eval": "off",
    },
  },
  {
    files: [
      "src/hooks/usePhpPlaygroundActions.ts",
      "src/playgrounds/engines/php.engine.ts",
      "src/services/php/service.ts",
      "src/services/php/transform.ts",
    ],
    rules: {
      "@typescript-eslint/no-implied-eval": "off",
      "@typescript-eslint/require-await": "off",
    },
  },
  prettierConfig,
  ...storybook.configs["flat/recommended"],
]);
