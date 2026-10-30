import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createWorkerClient,
  DEFAULT_WORKER_TIMEOUT_MS,
  WorkerTimeoutError,
} from "@/services/worker/clientFactory";

interface TestPayload {
  input: string;
}

interface TestRequest extends TestPayload {
  id: string;
}

interface TestResponse {
  id: string;
  ok: boolean;
  value?: string;
}

class MockWorker {
  static instances: MockWorker[] = [];

  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  postMessage = vi.fn();
  terminate = vi.fn();

  constructor() {
    MockWorker.instances.push(this);
  }

  emitMessage(data: unknown) {
    this.onmessage?.({ data } as MessageEvent);
  }
}

const createClient = (timeoutMs?: number) =>
  createWorkerClient<TestPayload, TestRequest, TestResponse>({
    workerFactory: () => new MockWorker() as unknown as Worker,
    idPrefix: "test",
    buildRequest: (id, payload) => ({ id, ...payload }),
    timeoutMs,
  });

const lastRequestId = () => {
  const worker = MockWorker.instances[0];
  return (worker.postMessage.mock.calls.at(-1)?.[0] as TestRequest).id;
};

describe("createWorkerClient timeout", () => {
  const originalWorker = globalThis.Worker;

  beforeEach(() => {
    vi.useFakeTimers();
    MockWorker.instances = [];
    globalThis.Worker = MockWorker as unknown as typeof Worker;
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.Worker = originalWorker;
  });

  it("rejects a request the worker never answers once the default timeout elapses", async () => {
    const run = createClient();

    const pending = run({ input: "x" });
    const assertion = expect(pending).rejects.toThrow(/timed out/i);

    await vi.advanceTimersByTimeAsync(DEFAULT_WORKER_TIMEOUT_MS);
    await assertion;
  });

  it("does not reject before the configured timeout", async () => {
    const run = createClient(1_000);
    const onReject = vi.fn();

    run({ input: "x" }).catch(onReject);
    await vi.advanceTimersByTimeAsync(999);
    expect(onReject).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(onReject).toHaveBeenCalledOnce();
  });

  it("removes the pending entry on timeout so a late response is ignored", async () => {
    const run = createClient(1_000);

    const pending = run({ input: "x" });
    const id = lastRequestId();
    const assertion = expect(pending).rejects.toThrow(/timed out/i);

    await vi.advanceTimersByTimeAsync(1_000);
    await assertion;

    // A late response for the expired id must be a no-op, not a crash.
    expect(() =>
      MockWorker.instances[0].emitMessage({ id, ok: true, value: "late" }),
    ).not.toThrow();
  });

  it("clears the timer when the worker answers in time", async () => {
    const run = createClient(1_000);

    const pending = run({ input: "x" });
    MockWorker.instances[0].emitMessage({ id: lastRequestId(), ok: true, value: "done" });

    await expect(pending).resolves.toEqual(expect.objectContaining({ ok: true, value: "done" }));
    expect(vi.getTimerCount()).toBe(0);
  });

  it("clears pending timers when the client is terminated", () => {
    const run = createClient(1_000);

    void run({ input: "x" }).catch(() => undefined);
    expect(vi.getTimerCount()).toBe(1);

    run.terminate();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("settles the requests still waiting when the client is terminated", async () => {
    const run = createClient(0);

    const waiting = run({ input: "x" });
    run.terminate();

    await expect(waiting).rejects.toThrow("Error en worker");
  });

  it("replaces a worker that misses its deadline and replays the requests queued behind it", async () => {
    const run = createClient(1_000);

    const hung = run({ input: "hang" });
    const assertion = expect(hung).rejects.toBeInstanceOf(WorkerTimeoutError);
    await vi.advanceTimersByTimeAsync(500);
    const queued = run({ input: "queued" });

    await vi.advanceTimersByTimeAsync(500);
    await assertion;

    const [stuck, fresh] = MockWorker.instances;
    expect(stuck.terminate).toHaveBeenCalledOnce();
    const replayed = fresh.postMessage.mock.calls[0]?.[0] as TestRequest;
    expect(replayed.input).toBe("queued");

    fresh.emitMessage({ id: replayed.id, ok: true, value: "done" });
    await expect(queued).resolves.toEqual(expect.objectContaining({ value: "done" }));
  });

  it("honours a per-request timeout override", async () => {
    const run = createClient(10_000);
    const onReject = vi.fn();

    run({ input: "x" }, { timeoutMs: 100 }).catch(onReject);
    await vi.advanceTimersByTimeAsync(100);

    expect(onReject).toHaveBeenCalledOnce();
  });

  it("disables the timeout when timeoutMs is 0", async () => {
    const run = createClient(0);

    void run({ input: "x" });
    expect(vi.getTimerCount()).toBe(0);
  });
});
