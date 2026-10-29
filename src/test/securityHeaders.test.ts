// @vitest-environment node
import { describe, it, expect } from "vitest";

// vitest.config.ts polyfills node builtins for the browser bundle; take the real ones.
const fs = process.getBuiltinModule("node:fs");
const path = process.getBuiltinModule("node:path");

interface HeaderRule {
  source: string;
  headers: { key: string; value: string }[];
}

interface ViteConfigLike {
  server?: { headers?: Record<string, string> };
  preview?: { headers?: Record<string, string> };
}

const root = process.cwd();
const vercel = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8")) as {
  headers: HeaderRule[];
};

/** Headers Vercel sends for `pathname`: every rule whose source matches, in order. */
function vercelHeadersFor(pathname: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const rule of vercel.headers) {
    // Vercel sources are path-to-regexp patterns; the ones used here are plain regex groups.
    if (new RegExp(`^${rule.source}$`).test(pathname)) {
      for (const header of rule.headers) result[header.key] = header.value;
    }
  }
  return result;
}

async function loadViteConfig(): Promise<ViteConfigLike> {
  // A variable specifier keeps vite.config.ts out of the app's type-checked program.
  const specifier = path.join(root, "vite.config.ts");
  const mod = (await import(/* @vite-ignore */ specifier)) as {
    default: (env: { mode: string; command: string }) => ViteConfigLike;
  };
  return mod.default({ mode: "production", command: "serve" });
}

describe("cross-origin isolation headers", () => {
  it("uses COEP credentialless on Vercel, so the HTML preview can load external images", () => {
    const headers = vercelHeadersFor("/playground/html");
    expect(headers["Cross-Origin-Opener-Policy"]).toBe("same-origin");
    expect(headers["Cross-Origin-Embedder-Policy"]).toBe("credentialless");
  });

  it("uses the same COOP/COEP in the Vite dev and preview servers", async () => {
    const config = await loadViteConfig();
    for (const headers of [config.server?.headers, config.preview?.headers]) {
      expect(headers?.["Cross-Origin-Opener-Policy"]).toBe("same-origin");
      expect(headers?.["Cross-Origin-Embedder-Policy"]).toBe("credentialless");
    }
  });
});
