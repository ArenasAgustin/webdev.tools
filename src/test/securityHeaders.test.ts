// @vitest-environment node
import { describe, it, expect } from "vitest";

// vitest.config.ts polyfills node builtins for the browser bundle; take the real ones.
const fs = process.getBuiltinModule("node:fs");
const path = process.getBuiltinModule("node:path");

interface HeaderRule {
  source: string;
  headers: { key: string; value: string }[];
}

type Middleware = (
  req: { url?: string },
  res: { setHeader: (key: string, value: string) => void },
  next: () => void,
) => void;

interface FakeServer {
  middlewares: { use: (middleware: Middleware) => void };
}

interface ViteConfigLike {
  server?: { headers?: Record<string, string> };
  preview?: { headers?: Record<string, string> };
  plugins?: unknown[];
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

describe("JS runner worker Content-Security-Policy", () => {
  it("blocks network and remote imports for the built runner worker on Vercel", () => {
    const csp = vercelHeadersFor("/assets/jsExecWorker-B5mqWJFL.js")["Content-Security-Policy"];
    expect(csp).toContain("default-src 'none'");
    expect(csp).toContain("script-src 'self' 'unsafe-eval'");
    expect(csp).not.toMatch(/connect-src|https:|data:|blob:/);
  });

  it("leaves other assets and pages without that policy", () => {
    expect(vercelHeadersFor("/assets/jsonWorker-DM7zA3Se.js")["Content-Security-Policy"]).toBeUndefined();
    expect(vercelHeadersFor("/playground/js")["Content-Security-Policy"]).toBeUndefined();
  });

  it("sends the same policy for the runner worker from the Vite dev and preview servers", async () => {
    const config = await loadViteConfig();
    const plugin = (config.plugins ?? [])
      .flat(Infinity)
      .find((p) => (p as { name?: string } | null)?.name === "js-runner-worker-csp") as
      | { configureServer: (s: FakeServer) => void; configurePreviewServer: (s: FakeServer) => void }
      | undefined;
    expect(plugin).toBeDefined();

    for (const hook of ["configureServer", "configurePreviewServer"] as const) {
      const middlewares: Middleware[] = [];
      plugin?.[hook]({ middlewares: { use: (m) => middlewares.push(m) } });
      const headersFor = (url: string) => {
        const headers: Record<string, string> = {};
        for (const m of middlewares) m({ url }, { setHeader: (k, v) => (headers[k] = v) }, () => {});
        return headers;
      };
      expect(
        headersFor("/src/workers/jsExecWorker.ts?worker_file&type=module")["Content-Security-Policy"],
      ).toBe(vercelHeadersFor("/assets/jsExecWorker-B5mqWJFL.js")["Content-Security-Policy"]);
      expect(headersFor("/assets/jsExecWorker-B5mqWJFL.js")["Content-Security-Policy"]).toBeDefined();
      expect(headersFor("/src/workers/jsonWorker.ts?worker_file")["Content-Security-Policy"]).toBeUndefined();
    }
  });
});
