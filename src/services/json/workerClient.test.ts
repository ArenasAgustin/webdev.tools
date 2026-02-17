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

describe("workerClient", () => {
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
    const { runJsonWorker } = await import("./workerClient");

    await expect(
      runJsonWorker({ action: "format", input: "{}", options: { indent: 2 } }),
    ).rejects.toThrow("Worker no disponible");
  });

  it("creates a worker and resolves response by request id", async () => {
    globalThis.Worker = MockWorker as unknown as typeof Worker;
    const { runJsonWorker } = await import("./workerClient");

    const pending = runJsonWorker({ action: "minify", input: '{ "a": 1 }' });
    const worker = MockWorker.instances[0];

    expect(worker).toBeDefined();
    expect(worker.postMessage).toHaveBeenCalledOnce();

    const firstCall = worker.postMessage.mock.calls[0]?.[0] as { id: string };
    worker.emitMessage({ id: firstCall.id, ok: true, value: '{"a":1}' });

    await expect(pending).resolves.toEqual({ id: firstCall.id, ok: true, value: '{"a":1}' });
  });

  it("reuses the same worker instance across requests", async () => {
    globalThis.Worker = MockWorker as unknown as typeof Worker;
    const { runJsonWorker } = await import("./workerClient");

    const first = runJsonWorker({ action: "format", input: "{}", options: { indent: 2 } });
    const firstWorker = MockWorker.instances[0];
    const firstMessage = firstWorker.postMessage.mock.calls[0][0] as { id: string };
    firstWorker.emitMessage({ id: firstMessage.id, ok: true, value: "{}" });
    await first;

    const second = runJsonWorker({ action: "clean", input: "{}", options: { removeNull: true } });
    const secondMessage = firstWorker.postMessage.mock.calls[1][0] as { id: string };
    firstWorker.emitMessage({ id: secondMessage.id, ok: true, value: "{}" });
    await second;

    expect(MockWorker.instances).toHaveLength(1);
    expect(firstWorker.postMessage).toHaveBeenCalledTimes(2);
  });

  it("rejects all pending requests on worker error", async () => {
    globalThis.Worker = MockWorker as unknown as typeof Worker;
    const { runJsonWorker } = await import("./workerClient");

    const first = runJsonWorker({ action: "format", input: "{}", options: { indent: 2 } });
    const second = runJsonWorker({ action: "minify", input: "{}" });
    const worker = MockWorker.instances[0];

    worker.emitError("boom");

    await expect(first).rejects.toThrow("boom");
    await expect(second).rejects.toThrow("boom");
  });
});
