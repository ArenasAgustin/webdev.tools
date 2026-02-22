import { vi } from "vitest";
import { defineWorkerServiceTests } from "@/test/workerHarness";
import { formatJsAsync, minifyJsAsync } from "./worker";
import * as workerClient from "./workerClient";

vi.mock("./workerClient", () => ({
  runJsWorker: vi.fn(),
}));

defineWorkerServiceTests({
  name: "js worker async services",
  runWorkerMock: vi.mocked(workerClient.runJsWorker) as unknown as {
    mockResolvedValue: (value: unknown) => void;
    mockRejectedValue: (value: unknown) => void;
  },
  formatAsync: (input) => formatJsAsync(input, 2),
  minifyAsync: (input) => minifyJsAsync(input),
  largeInput: 'const data = "' + "x".repeat(100_000) + '";',
  formatSuccessValue: "const x = 1;",
  minifyErrorValue: "Error en worker",
  fallbackOperations: [
    () => formatJsAsync("const arr = [1, 2, 3];" + " ".repeat(100_000), 2),
    () =>
      minifyJsAsync("const arr = [1, 2, 3];" + " ".repeat(100_000), {
        removeComments: true,
      }),
  ],
});
