import { describe, it, expect } from "vitest";
import { parseInput, unixToDate, convertTimestamp, getCurrentTimestamp } from "./timestamp.utils";

describe("timestamp.utils", () => {
  describe("parseInput", () => {
    it("parses Unix timestamp in seconds", () => {
      const result = parseInput("1712160000");
      expect(result).not.toBeNull();
      expect(result?.type).toBe("unix");
      expect(result?.value).toBe(1712160000);
    });

    it("parses Unix timestamp in milliseconds", () => {
      const result = parseInput("1712160000000");
      expect(result).not.toBeNull();
      expect(result?.type).toBe("unix");
      expect(result?.value).toBe(1712160000000);
    });

    it("parses ISO 8601 date string", () => {
      const result = parseInput("2024-04-03T12:00:00.000Z");
      expect(result).not.toBeNull();
      expect(result?.type).toBe("date");
      expect(result?.value).toBeInstanceOf(Date);
    });

    it("parses natural date string", () => {
      const result = parseInput("2024-04-03");
      expect(result).not.toBeNull();
      expect(result?.type).toBe("date");
    });

    it("returns null for invalid input", () => {
      const result = parseInput("not-a-valid-timestamp");
      expect(result).toBeNull();
    });

    it("returns null for empty input", () => {
      const result = parseInput("");
      expect(result).toBeNull();
    });
  });

  describe("unixToDate", () => {
    it("converts seconds to Date", () => {
      const date = unixToDate(1712160000);
      expect(date.getTime()).toBe(1712160000000);
    });

    it("converts milliseconds to Date", () => {
      const date = unixToDate(1712160000000);
      expect(date.getTime()).toBe(1712160000000);
    });
  });

  describe("convertTimestamp", () => {
    it("converts Unix timestamp to all formats", () => {
      const result = convertTimestamp("1712160000");
      expect(result).not.toBeNull();
      expect(result?.unixSeconds).toBe(1712160000);
      expect(result?.unixMilliseconds).toBe(1712160000000);
      // ISO8601 should contain the date
      expect(result?.iso8601).toContain("2024-04-03");
      expect(result?.rfc2822).toContain("2024");
    });

    it("converts date string to Unix timestamp", () => {
      const result = convertTimestamp("2024-04-03T12:00:00.000Z");
      expect(result).not.toBeNull();
      // The timestamp should be a valid number in a reasonable range
      expect(result?.unixSeconds).toBeGreaterThan(1700000000);
      expect(result?.unixSeconds).toBeLessThan(1800000000);
    });

    it("detects future timestamps", () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days from now
      const result = convertTimestamp(String(futureTimestamp));
      expect(result?.isFuture).toBe(true);
    });

    it("returns null for invalid input", () => {
      const result = convertTimestamp("invalid");
      expect(result).toBeNull();
    });
  });

  describe("getCurrentTimestamp", () => {
    it("returns current Unix timestamp in seconds", () => {
      const now = Math.floor(Date.now() / 1000);
      const result = getCurrentTimestamp();
      expect(result).toBeGreaterThanOrEqual(now - 1);
      expect(result).toBeLessThanOrEqual(now + 1);
    });
  });
});
