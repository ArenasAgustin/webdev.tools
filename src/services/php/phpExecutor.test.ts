import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { executePhpWithTimeout } from "./phpExecutor";
import type { PhpExecResponse } from "./phpExecutor";

class FakeWorker {
  static instances: FakeWorker[] = [];
  onmessage: ((event: MessageEvent<PhpExecResponse>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  posted: unknown[] = [];
  terminated = false;

  constructor() {
    FakeWorker.instances.push(this);
  }

  postMessage(message: unknown) {
    this.posted.push(message);
  }

  terminate() {
    this.terminated = true;
  }

  emit(message: PhpExecResponse) {
    this.onmessage?.({ data: message } as MessageEvent<PhpExecResponse>);
  }
}

describe("executePhpWithTimeout", () => {
  beforeEach(() => {
    FakeWorker.instances = [];
    vi.useFakeTimers();
    vi.stubGlobal("Worker", FakeWorker);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("runs the code in a worker and returns its result", async () => {
    const pending = executePhpWithTimeout("echo 1;", 1000);
    const worker = FakeWorker.instances[0];

    expect(worker.posted).toEqual([{ code: "echo 1;" }]);
    worker.emit({ type: "started" });
    worker.emit({ type: "done", result: { ok: true, value: "1" } });

    await expect(pending).resolves.toEqual({ ok: true, value: "1" });
    expect(worker.terminated).toBe(true);
  });

  it("terminates the worker when the code runs past the timeout", async () => {
    const pending = executePhpWithTimeout("while(true){}", 1000);
    const worker = FakeWorker.instances[0];
    worker.emit({ type: "started" });

    await vi.advanceTimersByTimeAsync(1000);

    const result = await pending;
    expect(result.ok).toBe(false);
    expect(worker.terminated).toBe(true);
  });

  it("does not count runtime loading against the execution timeout", async () => {
    const pending = executePhpWithTimeout("echo 1;", 1000);
    const worker = FakeWorker.instances[0];

    await vi.advanceTimersByTimeAsync(5000);
    expect(worker.terminated).toBe(false);

    worker.emit({ type: "started" });
    worker.emit({ type: "done", result: { ok: true, value: "1" } });
    await expect(pending).resolves.toEqual({ ok: true, value: "1" });
  });

  it("reports a worker crash as an error", async () => {
    const pending = executePhpWithTimeout("echo 1;", 1000);
    const worker = FakeWorker.instances[0];

    worker.onerror?.({ message: "boom", preventDefault: () => undefined } as ErrorEvent);

    await expect(pending).resolves.toEqual({ ok: false, error: { message: "boom" } });
    expect(worker.terminated).toBe(true);
  });
});
