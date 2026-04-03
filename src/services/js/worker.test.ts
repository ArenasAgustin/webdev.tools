import { describe, it, expect, vi } from "vitest";
import { defineWorkerServiceTests } from "@/test/workerHarness";
import { formatJsAsync, minifyJsAsync, cleanJsAsync } from "./worker";

import * as workerClient from "./workerClient";
vi.mock("./workerClient", () => ({
  jsWorkerAdapter: {
    run: vi.fn(),
  },
}));

describe("cleanJsAsync (sync path)", () => {
  it("returns error for empty input via sync path", async () => {
    const result = await cleanJsAsync("   ");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBeTruthy();
  });

  it("removes empty functions via sync path", async () => {
    const result = await cleanJsAsync("function noop() {} const x = 1;");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).not.toContain("function noop");
      expect(result.value).toContain("const x = 1");
    }
  });
});

describe("formatJsAsync error via sync path", () => {
  it("returns error for invalid JS on small input (sync path)", async () => {
    const result = await formatJsAsync("const =");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBeTruthy();
  });
});

defineWorkerServiceTests({
  name: "js worker async services",
  runWorkerMock: vi.mocked(workerClient.jsWorkerAdapter.run) as unknown as {
    mockResolvedValue: (value: unknown) => void;
    mockRejectedValue: (value: unknown) => void;
  },
  formatAsync: (input) => formatJsAsync(input, 2),
  minifyAsync: (input) => minifyJsAsync(input),
  largeInput: 'const data = "' + "x".repeat(100_000) + '";',
  formatSuccessValue: "const x = 1;",
  minifyErrorValue: { message: "Error en worker" },
  fallbackOperations: [
    () => formatJsAsync("const arr = [1, 2, 3];" + " ".repeat(100_000), 2),
    () =>
      minifyJsAsync("const arr = [1, 2, 3];" + " ".repeat(100_000), {
        removeComments: true,
      }),
  ],
});
