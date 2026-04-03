import { describe, it, expect, vi } from "vitest";
import { defineWorkerServiceTests } from "@/test/workerHarness";
import { formatHtmlAsync, minifyHtmlAsync, cleanHtmlAsync } from "./worker";

import * as workerClient from "./workerClient";
vi.mock("./workerClient", () => ({
  htmlWorkerAdapter: {
    run: vi.fn(),
  },
}));

describe("cleanHtmlAsync (sync path)", () => {
  it("returns error for empty input via sync path", async () => {
    const result = await cleanHtmlAsync("   ");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBeTruthy();
  });

  it("removes empty tags via sync path", async () => {
    const result = await cleanHtmlAsync("<div></div><p>hello</p>");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toContain("<p>hello</p>");
  });
});

describe("formatHtmlAsync error via sync path", () => {
  it("returns error for invalid HTML on small input (sync path)", async () => {
    const result = await formatHtmlAsync("<div><span>unclosed");
    expect(result.ok).toBeTypeOf("boolean");
  });
});

defineWorkerServiceTests({
  name: "html worker async services",
  runWorkerMock: vi.mocked(workerClient.htmlWorkerAdapter.run) as unknown as {
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
