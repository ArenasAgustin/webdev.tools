import { vi } from "vitest";
import { defineWorkerServiceTests } from "@/test/workerHarness";
import { formatCssAsync, minifyCssAsync } from "./worker";

import * as workerClient from "./workerClient";
vi.mock("./workerClient", () => ({
  cssWorkerAdapter: {
    run: vi.fn(),
  },
}));

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
