import { describe, it, expect, afterEach } from "vitest";
import { cssService } from "./service";
import { cssWorkerAdapter } from "./workerClient";

describe("cssService", () => {
  afterEach(() => {
    cssWorkerAdapter.terminate();
  });
  describe("format", () => {
    it("formats valid CSS", async () => {
      const result = await cssService.format(".card{color:red}");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain(".card");
      }
    });
  });

  describe("minify", () => {
    it("minifies valid CSS", async () => {
      const result = await cssService.minify(".card {\n  color: red;\n}");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(".card{color:red}");
      }
    });
  });

  describe("validate", () => {
    it("returns error for empty input", async () => {
      const result = await cssService.validate("");
      expect(result.ok).toBe(false);
    });

    it("returns ok for valid CSS", async () => {
      const result = await cssService.validate(".card { color: red; }");
      expect(result.ok).toBe(true);
    });
  });
});
