import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

interface WorkerLike {
  onmessage: ((event: MessageEvent) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  postMessage: (message: unknown) => void;
}

class MockWorker implements WorkerLike {
  static instances: MockWorker[] = [];

  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  postMessage = vi.fn();

  constructor() {
    MockWorker.instances.push(this);
  }

  emitMessage(data: unknown) {
    this.onmessage?.({ data } as MessageEvent);
  }

  emitError(message: string) {
    this.onerror?.({ message } as ErrorEvent);
  }
}

describe("js workerClient", () => {
  const originalWorker = globalThis.Worker;

  beforeEach(() => {
    vi.resetModules();
    MockWorker.instances = [];
  });

  afterEach(() => {
    globalThis.Worker = originalWorker;
    vi.restoreAllMocks();
  });

  it("rejects when Worker is not available", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globalThis.Worker = undefined as any;
    const { runJsWorker } = await import("./workerClient");

    await expect(
      runJsWorker({ action: "format", input: "const x=1;", options: { indentSize: 2 } }),
    ).rejects.toThrow("Worker no disponible");
  });

  it("creates a worker and resolves response by request id", async () => {
    globalThis.Worker = MockWorker as unknown as typeof Worker;
    const { runJsWorker } = await import("./workerClient");

    const pending = runJsWorker({ action: "minify", input: "const x = 1;" });
    const worker = MockWorker.instances[0];

    expect(worker).toBeDefined();
    expect(worker.postMessage).toHaveBeenCalledOnce();

    const firstCall = worker.postMessage.mock.calls[0]?.[0] as { id: string };
    worker.emitMessage({ id: firstCall.id, ok: true, value: "const x=1;" });

    await expect(pending).resolves.toEqual({ id: firstCall.id, ok: true, value: "const x=1;" });
  });

  it("reuses the same worker instance across requests", async () => {
    globalThis.Worker = MockWorker as unknown as typeof Worker;
    const { runJsWorker } = await import("./workerClient");

    const first = runJsWorker({
      action: "format",
      input: "const x=1;",
      options: { indentSize: 2 },
    });
    const firstWorker = MockWorker.instances[0];
    const firstMessage = firstWorker.postMessage.mock.calls[0][0] as { id: string };
    firstWorker.emitMessage({ id: firstMessage.id, ok: true, value: "const x = 1;" });
    await first;

    const second = runJsWorker({ action: "minify", input: "const x = 1;" });
    const secondMessage = firstWorker.postMessage.mock.calls[1][0] as { id: string };
    firstWorker.emitMessage({ id: secondMessage.id, ok: true, value: "const x=1;" });
    await second;

    expect(MockWorker.instances).toHaveLength(1);
    expect(firstWorker.postMessage).toHaveBeenCalledTimes(2);
  });

  it("rejects all pending requests on worker error", async () => {
    globalThis.Worker = MockWorker as unknown as typeof Worker;
    const { runJsWorker } = await import("./workerClient");

    const first = runJsWorker({
      action: "format",
      input: "const x=1;",
      options: { indentSize: 2 },
    });
    const second = runJsWorker({ action: "minify", input: "const x=1;" });
    const worker = MockWorker.instances[0];

    worker.emitError("boom");

    await expect(first).rejects.toThrow("boom");
    await expect(second).rejects.toThrow("boom");
  });
});
