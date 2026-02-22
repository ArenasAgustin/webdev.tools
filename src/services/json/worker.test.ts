import { vi } from "vitest";
import { defineWorkerServiceTests } from "@/test/workerHarness";
import { formatJsonAsync, minifyJsonAsync, cleanJsonAsync, applyJsonPathAsync } from "./worker";
import * as workerClient from "./workerClient";

vi.mock("./workerClient", () => ({
  runJsonWorker: vi.fn(),
}));

defineWorkerServiceTests({
  name: "worker async services",
  runWorkerMock: vi.mocked(workerClient.runJsonWorker) as unknown as {
    mockResolvedValue: (value: unknown) => void;
    mockRejectedValue: (value: unknown) => void;
  },
  formatAsync: (input) => formatJsonAsync(input, { indent: 2 }),
  minifyAsync: (input) => minifyJsonAsync(input),
  largeInput: '{"data":"' + "x".repeat(100_000) + '"}',
  formatSuccessValue: "formatted",
  minifyErrorValue: { message: "worker failed" },
  fallbackOperations: [
    () => cleanJsonAsync('{"keep":null,"arr":[]}' + " ".repeat(100_000), { removeNull: true }),
    () => applyJsonPathAsync('{"keep":null,"arr":[]}' + " ".repeat(100_000), "$.keep"),
  ],
});
