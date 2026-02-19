import { describe, it, expect, vi, beforeEach } from "vitest";
import { formatJsonAsync, minifyJsonAsync, cleanJsonAsync, applyJsonPathAsync } from "./worker";
import * as workerClient from "./workerClient";

vi.mock("./workerClient", () => ({
  runJsonWorker: vi.fn(),
}));

describe("worker async services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses worker for large format input and returns success", async () => {
    vi.mocked(workerClient.runJsonWorker).mockResolvedValue({
      id: "1",
      ok: true,
      value: "formatted",
    } as never);

    const largeInput = '{"data":"' + "x".repeat(100_000) + '"}';
    const result = await formatJsonAsync(largeInput, { indent: 2 });

    expect(workerClient.runJsonWorker).toHaveBeenCalled();
    expect(result).toEqual({ ok: true, value: "formatted" });
  });

  it("returns fallback error when worker responds with error", async () => {
    vi.mocked(workerClient.runJsonWorker).mockResolvedValue({
      id: "2",
      ok: false,
      error: { message: "worker failed" },
    } as never);

    const largeInput = '{"data":"' + "x".repeat(100_000) + '"}';
    const result = await minifyJsonAsync(largeInput);

    expect(result).toEqual({ ok: false, error: { message: "worker failed" } });
  });

  it("falls back to sync service when worker throws", async () => {
    vi.mocked(workerClient.runJsonWorker).mockRejectedValue(new Error("boom"));

    const largeInput = '{"keep":null,"arr":[]}' + " ".repeat(100_000);
    const cleanResult = await cleanJsonAsync(largeInput, { removeNull: true });
    const pathResult = await applyJsonPathAsync(largeInput, "$.keep");

    expect(cleanResult.ok).toBeTypeOf("boolean");
    expect(pathResult.ok).toBeTypeOf("boolean");
  });
});
