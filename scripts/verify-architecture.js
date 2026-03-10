#!/usr/bin/env node

/**
 * Architecture verification script
 * Ensures all playgrounds follow the required testing matrix.
 *
 * Usage: node scripts/verify-architecture.js
 * Exit code 0 = all checks pass, 1 = violations found
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const PLAYGROUNDS = ["css", "html", "js", "json"];

const red = (text) => `\x1b[31m${text}\x1b[0m`;
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;
const bold = (text) => `\x1b[1m${text}\x1b[0m`;

/**
 * Capitalize first letter of a string.
 * @param {string} str
 * @returns {string}
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Required files per playground, relative to project root.
 * @param {string} lang
 * @returns {{ path: string; label: string }[]}
 */
function getRequiredFiles(lang) {
  const cap = capitalize(lang);
  return [
    // Services
    {
      path: `src/services/${lang}/transform.ts`,
      label: "service transform",
    },
    {
      path: `src/services/${lang}/transform.test.ts`,
      label: "service transform tests",
    },
    {
      path: `src/services/${lang}/worker.ts`,
      label: "worker orchestration",
    },
    {
      path: `src/services/${lang}/worker.test.ts`,
      label: "worker tests",
    },
    {
      path: `src/services/${lang}/workerClient.ts`,
      label: "worker client",
    },
    {
      path: `src/services/${lang}/workerClient.test.ts`,
      label: "worker client tests",
    },
    {
      path: `src/services/${lang}/worker.types.ts`,
      label: "worker types",
    },
    // Playground components
    {
      path: `src/playgrounds/${lang}/${cap}Playground.tsx`,
      label: "playground component",
    },
    {
      path: `src/playgrounds/${lang}/${cap}Playground.test.tsx`,
      label: "playground component test",
    },
    {
      path: `src/playgrounds/${lang}/${cap}Playground.branches.test.tsx`,
      label: "playground branches test",
    },
    {
      path: `src/playgrounds/${lang}/${cap}Editors.tsx`,
      label: "editors component",
    },
    {
      path: `src/playgrounds/${lang}/${cap}Editors.test.tsx`,
      label: "editors component test",
    },
    {
      path: `src/playgrounds/${lang}/${lang}.config.ts`,
      label: "playground config",
    },
    {
      path: `src/playgrounds/${lang}/index.ts`,
      label: "playground index",
    },
    // E2E
    {
      path: `e2e/${lang}-workflow.spec.ts`,
      label: "E2E workflow",
    },
  ];
}

let violations = 0;

console.log(bold("\nArchitecture Verification\n"));

for (const lang of PLAYGROUNDS) {
  const files = getRequiredFiles(lang);
  const missing = [];

  for (const { path, label } of files) {
    if (!existsSync(resolve(root, path))) {
      missing.push({ path, label });
    }
  }

  if (missing.length === 0) {
    console.log(green(`  ✓ ${lang.toUpperCase()} — all required files present`));
  } else {
    console.log(red(`  ✗ ${lang.toUpperCase()} — ${missing.length} missing file(s):`));
    for (const { path, label } of missing) {
      console.log(red(`      - ${path} (${label})`));
    }
    violations += missing.length;
  }
}

// Shared E2E tests
console.log(bold("\nShared E2E tests\n"));
const sharedE2e = [
  { path: "e2e/smoke.spec.ts", label: "smoke tests" },
  { path: "e2e/cross-playground.spec.ts", label: "cross-playground navigation" },
  { path: "e2e/error-edge.spec.ts", label: "error/edge cases" },
  { path: "e2e/responsive-mobile.spec.ts", label: "responsive/mobile" },
];

for (const { path, label } of sharedE2e) {
  if (existsSync(resolve(root, path))) {
    console.log(green(`  ✓ ${label}`));
  } else {
    console.log(red(`  ✗ ${label} — missing: ${path}`));
    violations++;
  }
}

// Shared hooks with dedicated tests
console.log(bold("\nShared hooks with required tests\n"));
const requiredHookTests = [
  "useModalState.test.ts",
  "useTextStats.test.ts",
  "useToast.test.tsx",
  "useFocusTrap.test.tsx",
  "useExpandedEditor.test.ts",
];

for (const file of requiredHookTests) {
  const fullPath = `src/hooks/${file}`;
  if (existsSync(resolve(root, fullPath))) {
    console.log(green(`  ✓ ${file}`));
  } else {
    console.log(red(`  ✗ ${file} — missing`));
    violations++;
  }
}

// Test harness
console.log(bold("\nTest infrastructure\n"));
const infra = [
  { path: "src/test/workerHarness.ts", label: "worker test harness" },
  { path: "docs/TESTING_MATRIX.md", label: "testing matrix documentation" },
  { path: "docs/CONTRIBUTING_PLAYGROUND.md", label: "playground contribution guide" },
];

for (const { path, label } of infra) {
  if (existsSync(resolve(root, path))) {
    console.log(green(`  ✓ ${label}`));
  } else {
    console.log(yellow(`  ⚠ ${label} — missing: ${path}`));
  }
}

// Naming convention checks
console.log(bold("\nNaming conventions\n"));

for (const lang of PLAYGROUNDS) {
  const cap = capitalize(lang);
  const configPath = resolve(root, `src/playgrounds/${lang}/${lang}.config.ts`);

  if (existsSync(configPath)) {
    const content = readFileSync(configPath, "utf-8");

    // Check config export name follows convention: <lang>PlaygroundConfig
    const expectedExport = `${lang}PlaygroundConfig`;
    if (content.includes(expectedExport)) {
      console.log(green(`  ✓ ${lang.toUpperCase()} config export: ${expectedExport}`));
    } else {
      console.log(red(`  ✗ ${lang.toUpperCase()} config should export "${expectedExport}"`));
      violations++;
    }

    // Check id matches lang
    const idMatch = content.match(/id:\s*["']([^"']+)["']/);
    if (idMatch && idMatch[1] === lang) {
      console.log(green(`  ✓ ${lang.toUpperCase()} config id: "${lang}"`));
    } else {
      console.log(
        red(
          `  ✗ ${lang.toUpperCase()} config id should be "${lang}", found "${idMatch?.[1] ?? "none"}"`,
        ),
      );
      violations++;
    }
  }

  // Check playground component export name
  const playgroundPath = resolve(root, `src/playgrounds/${lang}/${cap}Playground.tsx`);
  if (existsSync(playgroundPath)) {
    const content = readFileSync(playgroundPath, "utf-8");
    const expectedComponent = `${cap}Playground`;
    if (
      content.includes(`function ${expectedComponent}`) ||
      content.includes(`const ${expectedComponent}`)
    ) {
      console.log(green(`  ✓ ${lang.toUpperCase()} component export: ${expectedComponent}`));
    } else {
      console.log(red(`  ✗ ${lang.toUpperCase()} component should export "${expectedComponent}"`));
      violations++;
    }
  }
}

// Registry check
console.log(bold("\nPlayground registry\n"));
const registryPath = resolve(root, "src/playgrounds/registry.ts");
if (existsSync(registryPath)) {
  const registryContent = readFileSync(registryPath, "utf-8");

  for (const lang of PLAYGROUNDS) {
    const configImport = `${lang}PlaygroundConfig`;
    if (registryContent.includes(configImport)) {
      console.log(green(`  ✓ ${lang.toUpperCase()} registered in registry`));
    } else {
      console.log(
        red(`  ✗ ${lang.toUpperCase()} not found in registry — add config import and entry`),
      );
      violations++;
    }
  }
} else {
  console.log(red("  ✗ src/playgrounds/registry.ts — missing"));
  violations++;
}

// Summary
console.log("");
if (violations === 0) {
  console.log(green(bold("✅ All architecture checks passed!\n")));
  process.exit(0);
} else {
  console.log(red(bold(`❌ ${violations} violation(s) found.\n`)));
  process.exit(1);
}
