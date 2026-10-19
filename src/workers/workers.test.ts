import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Worker entries bind `self.onmessage` at import time and answer through
 * `self.postMessage`. In the test environment `self` is the global window, so
 * each test re-imports the entry, swaps `postMessage` for a spy and dispatches
 * a request straight to the bound handler.
 */
interface WorkerScope {
  onmessage: ((event: MessageEvent) => void) | null;
  postMessage: (message: unknown) => void;
}

const scope = self as unknown as WorkerScope;

// Non-literal specifier: sqlWorker imports a `?url` asset whose type comes from
// `vite/client`, which the vitest tsconfig does not load. Vitest still resolves it.
const SQL_WORKER_ENTRY = "@/workers/sqlWorker";

const workerEntries = {
  css: () => import("@/workers/cssWorker"),
  js: () => import("@/workers/jsWorker"),
  html: () => import("@/workers/htmlWorker"),
  json: () => import("@/workers/jsonWorker"),
  sql: () => import(/* @vite-ignore */ SQL_WORKER_ENTRY),
} as const;

async function sendToWorker(entry: keyof typeof workerEntries, request: Record<string, unknown>) {
  vi.resetModules();
  await workerEntries[entry]();

  const postMessage = vi.fn();
  scope.postMessage = postMessage;
  scope.onmessage?.({ data: request } as MessageEvent);

  await vi.waitFor(() => expect(postMessage).toHaveBeenCalledOnce());
  return postMessage.mock.calls[0]?.[0] as {
    id: string;
    ok: boolean;
    value?: unknown;
    error?: { message: string };
  };
}

describe("worker entries", () => {
  const originalOnMessage = scope.onmessage;
  const originalPostMessage = scope.postMessage;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    scope.onmessage = originalOnMessage;
    scope.postMessage = originalPostMessage;
  });

  it("cssWorker answers a clean request with the cleaned output", async () => {
    const response = await sendToWorker("css", {
      id: "css-1",
      action: "clean",
      input: "a { color: red; }\nb {}",
      options: { removeEmptyRules: true },
    });

    expect(response.id).toBe("css-1");
    expect(response.ok).toBe(true);
    expect(response.value).toContain("color: red");
    expect(response.value).not.toContain("b {}");
  });

  it("jsWorker answers a clean request with the cleaned output", async () => {
    const response = await sendToWorker("js", {
      id: "js-1",
      action: "clean",
      input: "const a = 1;\nfunction empty() {}\n",
      options: {},
    });

    expect(response.id).toBe("js-1");
    expect(response.ok).toBe(true);
    expect(response.value).toContain("const a = 1");
  });

  it("htmlWorker answers a clean request with the cleaned output", async () => {
    const response = await sendToWorker("html", {
      id: "html-1",
      action: "clean",
      input: "<div><p>text</p><span></span></div>",
      options: { removeEmptyTags: true },
    });

    expect(response.id).toBe("html-1");
    expect(response.ok).toBe(true);
    expect(response.value).toContain("<p>text</p>");
    expect(response.value).not.toContain("<span></span>");
  });

  it.each(Object.keys(workerEntries) as (keyof typeof workerEntries)[])(
    "%sWorker replies with an error for an unknown action",
    async (entry) => {
      const response = await sendToWorker(entry, {
        id: `${entry}-unknown`,
        action: "does-not-exist",
        input: "x",
      });

      expect(response.id).toBe(`${entry}-unknown`);
      expect(response.ok).toBe(false);
      expect(response.error?.message).toContain("does-not-exist");
    },
  );
});
