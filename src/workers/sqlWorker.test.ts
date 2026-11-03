import { describe, it, expect, vi, beforeAll } from "vitest";
import { parseServiceMessage } from "@/services/serviceMessage";

const { initSqlJsMock } = vi.hoisted(() => ({ initSqlJsMock: vi.fn() }));

vi.mock("sql.js", () => ({ default: initSqlJsMock }));

interface WorkerScope {
  onmessage: ((event: MessageEvent) => void) | null;
  postMessage: (message: unknown) => void;
}

const scope = self as unknown as WorkerScope;

// Non-literal specifier: sqlWorker imports a `?url` asset whose type comes from
// `vite/client`, which the vitest tsconfig does not load. Vitest still resolves it.
const SQL_WORKER_ENTRY = "@/workers/sqlWorker";

async function send(request: Record<string, unknown>) {
  const postMessage = vi.fn();
  scope.postMessage = postMessage;
  scope.onmessage?.({ data: request } as MessageEvent);
  await vi.waitFor(() => expect(postMessage).toHaveBeenCalledOnce());
  return postMessage.mock.calls[0]?.[0] as { ok: boolean; error?: { message: string } };
}

describe("sqlWorker loading sql.js", () => {
  beforeAll(async () => {
    await import(/* @vite-ignore */ SQL_WORKER_ENTRY);
  });

  it("does not cache a failed load: the next request loads sql.js again", async () => {
    initSqlJsMock.mockRejectedValueOnce(new Error("NetworkError when attempting to fetch resource."));
    initSqlJsMock.mockResolvedValue({ Database: class {} });

    const failed = await send({ id: "1", action: "load", input: "" });
    expect(failed.ok).toBe(false);
    expect(parseServiceMessage(failed.error?.message ?? "")?.key).toBe("services.sql.loadError");

    const retried = await send({ id: "2", action: "load", input: "" });
    expect(retried.ok).toBe(true);
    expect(initSqlJsMock).toHaveBeenCalledTimes(2);
  });
});
