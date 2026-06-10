import { describe, it, expect } from "vitest";
import { formatBytes } from "./formatBytes";

describe("formatBytes", () => {
  it("formats zero as '0 B'", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("formats values under 1000 as plain bytes", () => {
    expect(formatBytes(1)).toBe("1 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(999)).toBe("999 B");
  });

  it("uses base 1000 for KB (consistent with project limits)", () => {
    expect(formatBytes(1000)).toBe("1 KB");
    expect(formatBytes(100000)).toBe("100 KB");
  });

  it("strips trailing zeros and keeps up to 2 decimals", () => {
    expect(formatBytes(1500)).toBe("1.5 KB");
    expect(formatBytes(1536)).toBe("1.54 KB");
  });

  it("formats MB", () => {
    expect(formatBytes(2000000)).toBe("2 MB");
    expect(formatBytes(1234567)).toBe("1.23 MB");
  });

  it("formats GB and TB", () => {
    expect(formatBytes(1000000000)).toBe("1 GB");
    expect(formatBytes(1000000000000)).toBe("1 TB");
  });

  it("treats negative or invalid input as 0 B", () => {
    expect(formatBytes(-5)).toBe("0 B");
    expect(formatBytes(Number.NaN)).toBe("0 B");
  });
});
