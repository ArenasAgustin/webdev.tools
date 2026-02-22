import { describe, it, expect, vi, beforeEach } from "vitest";
import { formatJsAsync, minifyJsAsync } from "./worker";
import * as workerClient from "./workerClient";

vi.mock("./workerClient", () => ({
  runJsWorker: vi.fn(),
}));

describe("js worker async services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses worker for large format input and returns success", async () => {
    vi.mocked(workerClient.runJsWorker).mockResolvedValue({
      id: "1",
      ok: true,
      value: "const x = 1;",
    } as never);

    const largeInput = 'const data = "' + "x".repeat(100_000) + '";';
    const result = await formatJsAsync(largeInput, 2);

    expect(workerClient.runJsWorker).toHaveBeenCalled();
    expect(result).toEqual({ ok: true, value: "const x = 1;" });
  });

  it("returns fallback error when worker responds with error", async () => {
    vi.mocked(workerClient.runJsWorker).mockResolvedValue({
      id: "2",
      ok: false,
      error: { message: "worker failed" },
    } as never);

    const largeInput = 'const data = "' + "x".repeat(100_000) + '";';
    const result = await minifyJsAsync(largeInput);

    expect(result).toEqual({ ok: false, error: "worker failed" });
  });

  it("falls back to sync service when worker throws", async () => {
    vi.mocked(workerClient.runJsWorker).mockRejectedValue(new Error("boom"));

    const largeInput = "const arr = [1, 2, 3];" + " ".repeat(100_000);
    const formatResult = await formatJsAsync(largeInput, 2);
    const minifyResult = await minifyJsAsync(largeInput, { removeComments: true });

    expect(formatResult.ok).toBeTypeOf("boolean");
    expect(minifyResult.ok).toBeTypeOf("boolean");
  });
});
