import { describe, it, expect, vi } from "vitest";
import { defineWorkerServiceTests } from "@/test/workerHarness";
import { formatCssAsync, minifyCssAsync, cleanCssAsync } from "./worker";

import * as workerClient from "./workerClient";
vi.mock("./workerClient", () => ({
  cssWorkerAdapter: {
    run: vi.fn(),
  },
}));

describe("cleanCssAsync (sync path)", () => {
  it("returns error for empty input via sync path", async () => {
    const result = await cleanCssAsync("   ");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toContain("vacío");
  });

  it("removes empty rules via sync path", async () => {
    const result = await cleanCssAsync(".empty {} .used { color: red; }");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).not.toContain(".empty");
      expect(result.value).toContain(".used");
    }
  });
});

describe("formatCssAsync error via sync path", () => {
  it("returns error for invalid CSS on small input (sync path)", async () => {
    const result = await formatCssAsync(".card { color: red;");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBeTruthy();
  });
});

defineWorkerServiceTests({
  name: "css worker async services",
  runWorkerMock: vi.mocked(workerClient.cssWorkerAdapter.run) as unknown as {
    mockResolvedValue: (value: unknown) => void;
    mockRejectedValue: (value: unknown) => void;
  },
  formatAsync: (input) => formatCssAsync(input, 2),
  minifyAsync: (input) => minifyCssAsync(input),
  largeInput: ".card { color: red; }" + " ".repeat(100_000),
  formatSuccessValue: ".card {\n  color: red;\n}",
  minifyErrorValue: { message: "Error en worker" },
  fallbackOperations: [
    () => formatCssAsync(".card { color: red; }" + " ".repeat(100_000), 2),
    () =>
      minifyCssAsync(".card { color: red; }" + " ".repeat(100_000), {
        removeComments: true,
      }),
  ],
});
