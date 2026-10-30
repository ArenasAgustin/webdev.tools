import { describe, it, expect, vi } from "vitest";
import { executeWorkerOperation } from "./runtime";
import { WorkerTimeoutError, WorkerUnavailableError } from "./clientFactory";

const BIG_INPUT = "x".repeat(64);

function run(runWorker: () => Promise<{ ok: boolean; value?: string }>) {
  const runSync = vi.fn(() => ({ ok: true as const, value: "sync" }));
  const result = executeWorkerOperation({
    input: BIG_INPUT,
    payload: {},
    runWorker,
    runSync,
    toError: (message: string) => message,
    thresholdBytes: 10,
  });
  return { result, runSync };
}

describe("executeWorkerOperation", () => {
  it("runs small inputs synchronously", async () => {
    const runSync = vi.fn(() => ({ ok: true as const, value: "sync" }));
    const result = await executeWorkerOperation({
      input: "x",
      payload: {},
      runWorker: vi.fn(),
      runSync,
      toError: (message: string) => message,
      thresholdBytes: 10,
    });
    expect(result).toEqual({ ok: true, value: "sync" });
  });

  it("does not rerun a heavy input on the main thread after a worker timeout", async () => {
    const { result, runSync } = run(() => Promise.reject(new WorkerTimeoutError(60_000)));

    expect(await result).toEqual({
      ok: false,
      error: "La operación tardó más de 60 segundos y se canceló",
    });
    expect(runSync).not.toHaveBeenCalled();
  });

  it("does not rerun a heavy input on the main thread after a worker crash", async () => {
    const { result, runSync } = run(() => Promise.reject(new Error("out of memory")));

    expect(await result).toEqual({ ok: false, error: "Error en worker" });
    expect(runSync).not.toHaveBeenCalled();
  });

  it("falls back to the main thread only when no worker can run at all", async () => {
    const { result, runSync } = run(() => Promise.reject(new WorkerUnavailableError("no workers")));

    expect(await result).toEqual({ ok: true, value: "sync" });
    expect(runSync).toHaveBeenCalledOnce();
  });
});
