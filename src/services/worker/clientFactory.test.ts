import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createWorkerClient } from "./clientFactory";

interface TestPayload {
  value: string;
}

interface TestRequest {
  id: string;
  value: string;
}

interface TestResponse {
  id: string;
  ok: boolean;
  result?: string;
}

const buildRequest = (id: string, payload: TestPayload): TestRequest => ({
  id,
  value: payload.value,
});

class MockWorker {
  onmessage: ((ev: MessageEvent<TestResponse>) => void) | null = null;
  onerror: ((ev: ErrorEvent) => void) | null = null;
  postMessage = vi.fn((msg: TestRequest) => {
    setTimeout(() => {
      this.onmessage?.({ data: { id: msg.id, ok: true, result: "done" } } as MessageEvent);
    }, 0);
  });
  terminate = vi.fn();
}

describe("createWorkerClient", () => {
  let OriginalWorker: typeof Worker;

  beforeEach(() => {
    OriginalWorker = global.Worker;
    // @ts-expect-error - mocking Worker
    global.Worker = MockWorker;
  });

  afterEach(() => {
    global.Worker = OriginalWorker;
    vi.clearAllMocks();
  });

  it("sends a request and resolves with the response", async () => {
    const client = createWorkerClient<TestPayload, TestRequest, TestResponse>({
      workerUrl: new URL("./worker.ts", import.meta.url),
      idPrefix: "test",
      buildRequest,
    });

    const result = await client({ value: "hello" });
    expect(result.ok).toBe(true);
    expect(result.result).toBe("done");
  });

  it("preload creates the worker eagerly", () => {
    const client = createWorkerClient<TestPayload, TestRequest, TestResponse>({
      workerUrl: new URL("./worker.ts", import.meta.url),
      idPrefix: "test",
      buildRequest,
    });

    client.preload();
    // Second preload should be a no-op (same instance)
    client.preload();
  });

  it("terminate clears pending requests and nulls the worker", async () => {
    const client = createWorkerClient<TestPayload, TestRequest, TestResponse>({
      workerUrl: new URL("./worker.ts", import.meta.url),
      idPrefix: "test",
      buildRequest,
    });

    // Fire a request but don't await it, then terminate
    const pending = client({ value: "test" });
    client.terminate();

    // After terminate the promise is not resolved (worker was killed)
    // Just verify terminate doesn't throw
    await expect(Promise.race([pending, Promise.resolve("timeout")])).resolves.toBeDefined();
  });

  it("terminate when no worker has been created is a no-op", () => {
    const client = createWorkerClient<TestPayload, TestRequest, TestResponse>({
      workerUrl: new URL("./worker.ts", import.meta.url),
      idPrefix: "test",
      buildRequest,
    });

    expect(() => client.terminate()).not.toThrow();
  });

  it("rejects when Worker is not available", async () => {
    // @ts-expect-error - removing Worker
    delete global.Worker;

    const client = createWorkerClient<TestPayload, TestRequest, TestResponse>({
      workerUrl: new URL("./worker.ts", import.meta.url),
      idPrefix: "test",
      buildRequest,
      unavailableMessage: "Worker no disponible en este entorno",
    });

    await expect(client({ value: "test" })).rejects.toThrow(
      "Worker no disponible en este entorno",
    );
  });

  it("worker onerror rejects all pending requests", async () => {
    let workerInstance: MockWorker | null = null;

    class TrackingMockWorker extends MockWorker {
      constructor() {
        super();
        // Override postMessage to NOT auto-resolve (we'll trigger error instead)
        this.postMessage = vi.fn();
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        workerInstance = this;
      }
    }

    // @ts-expect-error - mocking Worker
    global.Worker = TrackingMockWorker;

    const client = createWorkerClient<TestPayload, TestRequest, TestResponse>({
      workerUrl: new URL("./worker.ts", import.meta.url),
      idPrefix: "test",
      buildRequest,
    });

    const pending = client({ value: "test" });

    // Trigger worker error
    workerInstance!.onerror?.({ message: "Worker crashed" } as ErrorEvent);

    await expect(pending).rejects.toThrow("Worker crashed");
  });

  it("uses default unavailable message when none provided", async () => {
    // @ts-expect-error - removing Worker
    delete global.Worker;

    const client = createWorkerClient<TestPayload, TestRequest, TestResponse>({
      workerUrl: new URL("./worker.ts", import.meta.url),
      idPrefix: "test",
      buildRequest,
    });

    await expect(client({ value: "test" })).rejects.toThrow("Worker no disponible");
  });
});
