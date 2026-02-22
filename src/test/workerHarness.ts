import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Result } from "@/types/common";

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

interface WorkerClientHarnessOptions<TPayload> {
  name: string;
  loadClient: () => Promise<(payload: TPayload) => Promise<unknown>>;
  initialPayload: TPayload;
  reusePayloads: [TPayload, TPayload];
  successValues: {
    initial: string;
    reuseFirst: string;
    reuseSecond: string;
  };
}

export function defineWorkerClientTests<TPayload>(options: WorkerClientHarnessOptions<TPayload>) {
  const { name, loadClient, initialPayload, reusePayloads, successValues } = options;
  const originalWorker = globalThis.Worker;

  describe(name, () => {
    beforeEach(() => {
      vi.resetModules();
      MockWorker.instances = [];
    });

    afterEach(() => {
      globalThis.Worker = originalWorker;
      vi.restoreAllMocks();
    });

    it("rejects when Worker is not available", async () => {
      globalThis.Worker = undefined as unknown as typeof Worker;
      const runWorker = await loadClient();

      await expect(runWorker(initialPayload)).rejects.toThrow("Worker no disponible");
    });

    it("creates a worker and resolves response by request id", async () => {
      globalThis.Worker = MockWorker as unknown as typeof Worker;
      const runWorker = await loadClient();

      const pending = runWorker(initialPayload);
      const worker = MockWorker.instances[0];

      expect(worker).toBeDefined();
      expect(worker.postMessage).toHaveBeenCalledOnce();

      const firstCall = worker.postMessage.mock.calls[0]?.[0] as { id: string };
      worker.emitMessage({ id: firstCall.id, ok: true, value: successValues.initial });

      await expect(pending).resolves.toEqual({
        id: firstCall.id,
        ok: true,
        value: successValues.initial,
      });
    });

    it("reuses the same worker instance across requests", async () => {
      globalThis.Worker = MockWorker as unknown as typeof Worker;
      const runWorker = await loadClient();

      const first = runWorker(reusePayloads[0]);
      const firstWorker = MockWorker.instances[0];
      const firstMessage = firstWorker.postMessage.mock.calls[0][0] as { id: string };
      firstWorker.emitMessage({ id: firstMessage.id, ok: true, value: successValues.reuseFirst });
      await first;

      const second = runWorker(reusePayloads[1]);
      const secondMessage = firstWorker.postMessage.mock.calls[1][0] as { id: string };
      firstWorker.emitMessage({ id: secondMessage.id, ok: true, value: successValues.reuseSecond });
      await second;

      expect(MockWorker.instances).toHaveLength(1);
      expect(firstWorker.postMessage).toHaveBeenCalledTimes(2);
    });

    it("rejects all pending requests on worker error", async () => {
      globalThis.Worker = MockWorker as unknown as typeof Worker;
      const runWorker = await loadClient();

      const first = runWorker(reusePayloads[0]);
      const second = runWorker(reusePayloads[1]);
      const worker = MockWorker.instances[0];

      worker.emitError("boom");

      await expect(first).rejects.toThrow("boom");
      await expect(second).rejects.toThrow("boom");
    });
  });
}

interface WorkerServiceHarnessOptions<TError> {
  name: string;
  runWorkerMock: {
    mockResolvedValue: (value: unknown) => void;
    mockRejectedValue: (value: unknown) => void;
  };
  formatAsync: (input: string, options?: unknown) => Promise<Result<string, TError>>;
  minifyAsync: (input: string, options?: unknown) => Promise<Result<string, TError>>;
  largeInput: string;
  formatSuccessValue: string;
  minifyErrorValue: TError;
  fallbackOperations?: (() => Promise<Result<string, TError>>)[];
}

export function defineWorkerServiceTests<TError>(options: WorkerServiceHarnessOptions<TError>) {
  const {
    name,
    runWorkerMock,
    formatAsync,
    minifyAsync,
    largeInput,
    formatSuccessValue,
    minifyErrorValue,
    fallbackOperations,
  } = options;

  describe(name, () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("uses worker for large format input and returns success", async () => {
      runWorkerMock.mockResolvedValue({ id: "1", ok: true, value: formatSuccessValue } as never);

      const result = await formatAsync(largeInput);

      expect(result).toEqual({ ok: true, value: formatSuccessValue });
    });

    it("returns fallback error when worker responds with error", async () => {
      runWorkerMock.mockResolvedValue({ id: "2", ok: false, error: minifyErrorValue } as never);

      const result = await minifyAsync(largeInput);

      expect(result).toEqual({ ok: false, error: minifyErrorValue });
    });

    it("falls back to sync service when worker throws", async () => {
      runWorkerMock.mockRejectedValue(new Error("boom"));

      const ops = fallbackOperations ?? [
        () => formatAsync(largeInput),
        () => minifyAsync(largeInput),
      ];
      const results = await Promise.all(ops.map((op) => op()));

      results.forEach((result) => {
        expect(result.ok).toBeTypeOf("boolean");
      });
    });
  });
}
