import { vi } from "vitest";
import { defineWorkerServiceTests } from "@/test/workerHarness";
import { formatHtmlAsync, minifyHtmlAsync } from "./worker";
import * as workerClient from "./workerClient";

vi.mock("./workerClient", () => ({
  runHtmlWorker: vi.fn(),
}));

defineWorkerServiceTests({
  name: "html worker async services",
  runWorkerMock: vi.mocked(workerClient.runHtmlWorker) as unknown as {
    mockResolvedValue: (value: unknown) => void;
    mockRejectedValue: (value: unknown) => void;
  },
  formatAsync: (input) => formatHtmlAsync(input, { indentSize: 2 }),
  minifyAsync: (input) =>
    minifyHtmlAsync(input, {
      removeComments: true,
      collapseWhitespace: true,
      minifyCss: false,
      minifyJs: false,
    }),
  largeInput: "<div><span>ok</span></div>" + " ".repeat(100_000),
  formatSuccessValue: "<div>\n  <span>ok</span>\n</div>",
  minifyErrorValue: { message: "Error en worker" },
  fallbackOperations: [
    () =>
      formatHtmlAsync("<div><span>ok</span></div>" + " ".repeat(100_000), {
        indentSize: 2,
      }),
    () =>
      minifyHtmlAsync("<div><span>ok</span></div>" + " ".repeat(100_000), {
        removeComments: true,
        collapseWhitespace: true,
        minifyCss: false,
        minifyJs: false,
      }),
  ],
});
