// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  parseInput,
  unixToDate,
  convertTimestamp,
  getCurrentTimestamp,
  detectUnixUnit,
  withUtc,
  ambiguousDayMonth,
} from "./timestamp.utils";

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

    it("formats past relative times with 'ago' in English and 'hace' in Spanish", () => {
      const past = String(Math.floor(Date.now() / 1000) - 2 * 3600);
      expect(convertTimestamp(past, "UTC", "en")?.relative).toBe("2 hours ago");
      expect(convertTimestamp(past, "UTC", "es")?.relative).toBe("hace 2 horas");
    });

    it("parses negative Unix timestamps as numbers, not dates", () => {
      expect(parseInput("-1")).toEqual({ type: "unix", value: -1 });
      expect(parseInput("-86400")).toEqual({ type: "unix", value: -86400 });
    });

    it.each(["2024/01/15", "Jan 15 2024", "15 January 2024", "January 15, 2024"])(
      "parses the date format %j",
      (value) => {
        const result = parseInput(value);
        expect(result?.type).toBe("date");
        const date = result?.value as Date;
        expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2024, 0, 15]);
      },
    );

    it.each([
      ["2024-01-15", "America/New_York", Date.UTC(2024, 0, 15, 5)],
      ["2024-01-15 10:00", "Asia/Tokyo", Date.UTC(2024, 0, 15, 1)],
      ["2024-01-15T10:00:30", "UTC", Date.UTC(2024, 0, 15, 10, 0, 30)],
      ["2024/01/15", "Europe/Madrid", Date.UTC(2024, 0, 14, 23)],
      ["2024.01.15", "UTC", Date.UTC(2024, 0, 15)],
      ["01/15/2024 10:30", "UTC", Date.UTC(2024, 0, 15, 10, 30)],
      ["2024-12", "UTC", Date.UTC(2024, 11, 1)],
      ["Jan 15 2024", "America/New_York", Date.UTC(2024, 0, 15, 5)],
      ["2024-07-01T12:00", "Europe/London", Date.UTC(2024, 6, 1, 11)],
      ["2024-02-29", "UTC", Date.UTC(2024, 1, 29)],
    ])("reads the zone-less date %j in the selected timezone %s", (value, timezone, expected) => {
      expect(convertTimestamp(value, timezone, "en")?.unixMilliseconds).toBe(expected);
    });

    it("keeps an explicit offset or Z whatever the selected timezone", () => {
      expect(convertTimestamp("2024-01-15T10:00:00Z", "Asia/Tokyo", "en")?.unixMilliseconds).toBe(
        Date.UTC(2024, 0, 15, 10),
      );
      expect(convertTimestamp("2024-01-15T10:00:00+02:00", "UTC", "en")?.unixMilliseconds).toBe(
        Date.UTC(2024, 0, 15, 8),
      );
    });

    it.each(["2024-02-30", "2023-02-29", "2024-13-01", "2024-04-31 10:00", "2024-01-15 25:00", "2024-01-15T10:60", "02/30/2024", "2024/02/30"])(
      "rejects the impossible date %j instead of rolling it over",
      (value) => {
        expect(parseInput(value, "UTC")).toBeNull();
        expect(convertTimestamp(value, "UTC", "en")).toBeNull();
      },
    );

    it.each([
      ["15/01/2024", Date.UTC(2024, 0, 15)],
      ["31.12.2023 23:59", Date.UTC(2023, 11, 31, 23, 59)],
      ["05/05/2024", Date.UTC(2024, 4, 5)],
    ])("reads the unambiguous day-first date %j", (value, expected) => {
      expect((parseInput(value, "UTC")?.value as Date).getTime()).toBe(expected);
    });

    it.each(["01/02/2024", "03.04.2024 10:00"])(
      "does not guess the order of the ambiguous date %j",
      (value) => {
        expect(parseInput(value, "UTC")).toBeNull();
        expect(ambiguousDayMonth(value)).toEqual(
          value.startsWith("01")
            ? { monthFirst: "2024-01-02", dayFirst: "2024-02-01" }
            : { monthFirst: "2024-03-04", dayFirst: "2024-04-03" },
        );
      },
    );

    it.each(["15/01/2024", "01/15/2024", "05/05/2024", "2024/01/02", "2024-01-02"])(
      "does not flag %j as ambiguous",
      (value) => {
        expect(ambiguousDayMonth(value)).toBeNull();
      },
    );

    it.each(["not-a-valid-timestamp 3", "hello 5", "version 2"])(
      "rejects free text that the engine would read as a date: %j",
      (value) => {
        expect(parseInput(value)).toBeNull();
      },
    );
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

  describe("detectUnixUnit", () => {
    it("reads values up to 1e11 as seconds and larger ones as milliseconds", () => {
      expect(detectUnixUnit(1712160000)).toBe("seconds");
      expect(detectUnixUnit(1e11)).toBe("seconds");
      expect(detectUnixUnit(1e11 + 1)).toBe("milliseconds");
      expect(detectUnixUnit(-1712160000000)).toBe("milliseconds");
    });

    it("reports the detected unit on the result (null for date strings)", () => {
      expect(convertTimestamp("1712160000")?.unit).toBe("seconds");
      expect(convertTimestamp("1712160000000")?.unit).toBe("milliseconds");
      expect(convertTimestamp("2024-04-03")?.unit).toBeNull();
    });
  });

  describe("relative time", () => {
    it("says just now for differences under a second instead of 0 seconds", () => {
      const now = 1712160000_500;
      expect(convertTimestamp("1712160000", "UTC", "es", now)?.relative).toBe("ahora mismo");
      expect(convertTimestamp("1712160000", "UTC", "en", now)?.relative).toBe("just now");
      expect(convertTimestamp("1712160000", "UTC", "es", now + 4600)?.relative).toBe(
        "hace 5 segundos",
      );
    });

    it.each([360, 362, 364])("says 11 months, not 12, for %i days", (days) => {
      const now = 1712160000_000;
      const past = String(1712160000 - days * 86400);
      expect(convertTimestamp(past, "UTC", "es", now)?.relative).toBe("hace 11 meses");
      expect(convertTimestamp(past, "UTC", "en", now)?.relative).toBe("11 months ago");
    });
  });

  describe("withUtc", () => {
    it("adds UTC when the engine list lacks it", () => {
      expect(withUtc(["Europe/Paris"])).toEqual(["UTC", "Europe/Paris"]);
      expect(withUtc(["UTC", "Europe/Paris"])).toEqual(["UTC", "Europe/Paris"]);
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
