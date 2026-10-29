import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DEFAULT_WORKER_TIMEOUT_MS } from "@/services/worker/clientFactory";
import { WORKER_THRESHOLD_BYTES } from "@/utils/constants/limits";

/** A worker that accepts messages but never answers (the pre-fix `clean` behaviour). */
class SilentWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  postMessage = vi.fn();
  terminate = vi.fn();
}

describe("cleanCssAsync on large input", () => {
  const originalWorker = globalThis.Worker;

  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    globalThis.Worker = SilentWorker as unknown as typeof Worker;
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.Worker = originalWorker;
  });

  it("reports a timeout instead of rerunning on the main thread when the worker never answers", async () => {
    const { cleanCssAsync } = await import("@/services/css/worker");
    const rule = "a { color: red; }\nb {}\n";
    const input = rule.repeat(Math.ceil(WORKER_THRESHOLD_BYTES / rule.length) + 1);

    const pending = cleanCssAsync(input, { removeEmptyRules: true });
    await vi.advanceTimersByTimeAsync(DEFAULT_WORKER_TIMEOUT_MS);
    const result = await pending;

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe("La operación tardó más de 60 segundos y se canceló");
    }
  });
});
