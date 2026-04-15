import { describe, it, expect, afterEach } from "vitest";
import { htmlService } from "./service";
import { htmlWorkerAdapter } from "./workerClient";

describe("htmlService", () => {
  afterEach(() => {
    htmlWorkerAdapter.terminate();
  });
  describe("format", () => {
    it("formats valid HTML", async () => {
      const result = await htmlService.format("<div><p>test</p></div>");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain("<div>");
      }
    });
  });

  describe("minify", () => {
    it("minifies valid HTML", async () => {
      const result = await htmlService.minify("<div>\n  <p>test</p>\n</div>");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("<div><p>test</p></div>");
      }
    });
  });

  describe("validate", () => {
    it("returns error for empty input", async () => {
      const result = await htmlService.validate("");
      expect(result.ok).toBe(false);
    });

    it("returns ok for valid HTML", async () => {
      const result = await htmlService.validate("<div>test</div>");
      expect(result.ok).toBe(true);
    });
  });
});
