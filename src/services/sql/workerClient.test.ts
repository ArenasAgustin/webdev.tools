import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { defineWorkerClientTests } from "@/test/workerHarness";
import type { SqlWorkerPayload } from "@/services/sql/worker.types";

// --- Shared harness tests (reuse / id matching / error propagation) ---

defineWorkerClientTests<SqlWorkerPayload>({
  name: "sqlWorkerAdapter (harness)",
  loadClient: async () => {
    vi.resetModules();
    const { sqlWorkerAdapter } = await import("@/services/sql/workerClient");
    return (payload) => sqlWorkerAdapter.run(payload);
  },
  initialPayload: { action: "format", input: "SELECT 1", options: { dialect: "sql", tabWidth: 2 } },
  reusePayloads: [
    { action: "minify", input: "SELECT 1" },
    { action: "minify", input: "SELECT 2" },
  ],
  successValues: {
    initial: "SELECT\n  1",
    reuseFirst: "SELECT 1",
    reuseSecond: "SELECT 2",
  },
});

// --- Action round-trip tests ---

class MockWorker {
  static instances: MockWorker[] = [];

  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  postMessage = vi.fn();
  terminate = vi.fn();

  constructor() {
    MockWorker.instances.push(this);
  }

  emit(data: unknown) {
    this.onmessage?.({ data } as MessageEvent);
  }
}

describe("sqlWorkerAdapter action round-trips", () => {
  const originalWorker = globalThis.Worker;

  beforeEach(() => {
    vi.resetModules();
    MockWorker.instances = [];
    globalThis.Worker = MockWorker as unknown as typeof Worker;
  });

  afterEach(() => {
    globalThis.Worker = originalWorker;
    vi.restoreAllMocks();
  });

  async function getAdapter() {
    const { sqlWorkerAdapter } = await import("@/services/sql/workerClient");
    return sqlWorkerAdapter;
  }

  it("FORMAT round-trip", async () => {
    const adapter = await getAdapter();
    const pending = adapter.run({ action: "format", input: "SELECT 1", options: { dialect: "sql", tabWidth: 2 } });

    const worker = MockWorker.instances[0];
    const call = worker.postMessage.mock.calls[0]?.[0] as { id: string };
    worker.emit({ id: call.id, ok: true, value: "SELECT\n  1" });

    const result = await pending;
    expect(result.ok).toBe(true);
    expect((result as { value: string }).value).toBe("SELECT\n  1");
  });

  it("VALIDATE round-trip", async () => {
    const adapter = await getAdapter();
    const pending = adapter.run({ action: "validate", input: "SELECT 1", options: { dialect: "sql", tabWidth: 2 } });

    const worker = MockWorker.instances[0];
    const call = worker.postMessage.mock.calls[0]?.[0] as { id: string };
    worker.emit({ id: call.id, ok: true, value: "" });

    const result = await pending;
    expect(result.ok).toBe(true);
  });

  it("MINIFY round-trip", async () => {
    const adapter = await getAdapter();
    const pending = adapter.run({ action: "minify", input: "SELECT\n  1" });

    const worker = MockWorker.instances[0];
    const call = worker.postMessage.mock.calls[0]?.[0] as { id: string };
    worker.emit({ id: call.id, ok: true, value: "SELECT 1" });

    const result = await pending;
    expect(result.ok).toBe(true);
    expect((result as { value: string }).value).toBe("SELECT 1");
  });

  it("EXECUTE round-trip — returns SqlExecuteResult", async () => {
    const adapter = await getAdapter();
    const pending = adapter.run({ action: "execute", input: "SELECT 1 AS n" });

    const worker = MockWorker.instances[0];
    const call = worker.postMessage.mock.calls[0]?.[0] as { id: string };
    worker.emit({
      id: call.id,
      ok: true,
      action: "execute",
      value: { resultSets: [{ statement: 1, columns: ["n"], rows: [[1]], truncated: false }], elapsedMs: 5, truncated: false },
    });

    const result = await pending;
    expect(result.ok).toBe(true);
  });

  it("RESET round-trip", async () => {
    const adapter = await getAdapter();
    const pending = adapter.run({ action: "reset", input: "" });

    const worker = MockWorker.instances[0];
    const call = worker.postMessage.mock.calls[0]?.[0] as { id: string };
    worker.emit({ id: call.id, ok: true, value: "reset" });

    const result = await pending;
    expect(result.ok).toBe(true);
  });

  it("error propagation — worker returns ok: false", async () => {
    const adapter = await getAdapter();
    const pending = adapter.run({ action: "format", input: "BAD SQL", options: { dialect: "sql", tabWidth: 2 } });

    const worker = MockWorker.instances[0];
    const call = worker.postMessage.mock.calls[0]?.[0] as { id: string };
    worker.emit({ id: call.id, ok: false, error: { message: "parse error" } });

    const result = await pending;
    expect(result.ok).toBe(false);
    expect((result as { error: { message: string } }).error.message).toBe("parse error");
  });

  it.each([
    ["formatSqlAsync", "Error al formatear SQL"],
    ["validateSqlAsync", "Error al validar SQL"],
    ["minifySqlAsync", "Error al minificar SQL"],
    ["resetSqlAsync", "Error al reiniciar la base de datos"],
  ] as const)("%s localizes the fallback when the worker sends no message", async (name, expected) => {
    const facade = await import("@/services/sql/worker");
    const pending = (facade[name] as (input: string) => Promise<{ ok: boolean; error?: string }>)("x");
    const worker = MockWorker.instances[0];
    const call = worker.postMessage.mock.calls[0]?.[0] as { id: string };
    worker.emit({ id: call.id, ok: false, error: {} });

    await expect(pending).resolves.toEqual({ ok: false, error: expected });
  });

  it("EXECUTE timeout — cancels a runaway query, reports the reset and keeps format working", async () => {
    vi.useFakeTimers();
    try {
      const { executeSqlAsync, formatSqlAsync, SQL_EXECUTION_TIMEOUT_MS } = await import(
        "@/services/sql/worker"
      );
      const pending = executeSqlAsync(
        "WITH RECURSIVE c(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM c) SELECT count(*) FROM c;",
      );

      const stuck = MockWorker.instances[0];
      const load = stuck.postMessage.mock.calls[0]?.[0] as { id: string; action: string };
      expect(load.action).toBe("load");
      stuck.emit({ id: load.id, ok: true, value: "" });
      await vi.advanceTimersByTimeAsync(0);
      expect((stuck.postMessage.mock.calls[1]?.[0] as { action: string }).action).toBe("execute");

      await vi.advanceTimersByTimeAsync(SQL_EXECUTION_TIMEOUT_MS);
      const result = await pending;
      expect(result.ok).toBe(false);
      expect((result as { error: string }).error).toMatch(/segundos.*base de datos se reinició/);
      expect(result).toMatchObject({ databaseReset: true });
      expect(stuck.terminate).toHaveBeenCalledOnce();

      const formatted = formatSqlAsync("select 1");
      const fresh = MockWorker.instances[1];
      const call = fresh.postMessage.mock.calls[0]?.[0] as { id: string };
      fresh.emit({ id: call.id, ok: true, value: "SELECT\n  1" });
      await expect(formatted).resolves.toEqual({ ok: true, value: "SELECT\n  1" });
    } finally {
      vi.useRealTimers();
    }
  });

  it("cleanup — terminate() can be called without errors", async () => {
    const adapter = await getAdapter();

    // Start a request
    void adapter.run({ action: "minify", input: "SELECT 1" });

    // Terminate should not throw
    expect(() => adapter.terminate()).not.toThrow();

    // Calling terminate a second time should also be safe
    expect(() => adapter.terminate()).not.toThrow();
  });
});
