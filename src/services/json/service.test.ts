import { describe, it, expect } from "vitest";
import { jsonService } from "./service";

describe("jsonService", () => {
  describe("format", () => {
    it("formats valid JSON", async () => {
      const result = await jsonService.format('{"a":1}');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe('{\n  "a": 1\n}');
      }
    });
  });

  describe("minify", () => {
    it("minifies valid JSON", async () => {
      const result = await jsonService.minify('{\n  "a": 1\n}');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe('{"a":1}');
      }
    });
  });

  describe("validate", () => {
    it("returns error for empty input", async () => {
      const result = await jsonService.validate("");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe("No hay JSON para procesar");
      }
    });

    it("returns error for invalid JSON", async () => {
      const result = await jsonService.validate("{invalid}");
      expect(result.ok).toBe(false);
    });

    it("returns ok for valid JSON", async () => {
      const result = await jsonService.validate('{"a":1}');
      expect(result.ok).toBe(true);
    });
  });
});
