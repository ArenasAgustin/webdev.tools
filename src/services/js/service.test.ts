import { describe, it, expect } from "vitest";
import { jsService } from "./service";

describe("jsService", () => {
  describe("format", () => {
    it("formats valid JS", async () => {
      const result = await jsService.format("const a=1");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain("const a");
      }
    });
  });

  describe("minify", () => {
    it("minifies valid JS", async () => {
      const result = await jsService.minify("const a = 1;");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("const a=1;");
      }
    });
  });

  describe("validate", () => {
    it("returns error for empty input", async () => {
      const result = await jsService.validate("");
      expect(result.ok).toBe(false);
    });

    it("returns ok for valid JS", async () => {
      const result = await jsService.validate("const a = 1;");
      expect(result.ok).toBe(true);
    });
  });
});
