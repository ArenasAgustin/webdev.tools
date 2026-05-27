import { vi } from "vitest";
import { defineWorkerServiceTests } from "@/test/workerHarness";
import { formatJsonAsync, minifyJsonAsync, cleanJsonAsync, applyJsonPathAsync } from "./worker";

import * as workerClient from "./workerClient";
vi.mock("./workerClient", () => ({
  jsonWorkerAdapter: {
    run: vi.fn().mockResolvedValue({ ok: true, value: "mocked" }),
  },
}));

defineWorkerServiceTests({
  name: "worker async services",
  runWorkerMock: {
    mockImplementationOnce: (implementation) => vi.mocked(workerClient.jsonWorkerAdapter.run).mockImplementationOnce(implementation),
  },
  formatAsync: (input) => formatJsonAsync(input, { indentSize: 2 }),
  minifyAsync: (input) => minifyJsonAsync(input),
  largeInput: '{"data":"' + "x".repeat(100_000) + '"}',
  formatSuccessValue: "formatted",
  minifyErrorValue: { message: "worker failed" },
  fallbackOperations: [
    () => Promise.resolve({ ok: true, value: "cleaned" }),
    () => Promise.resolve({ ok: true, value: "applied" }),
  ],
});
