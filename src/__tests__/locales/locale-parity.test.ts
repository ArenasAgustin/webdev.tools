import { describe, it, expect } from "vitest";
import en from "@/locales/en/translation.json";
import es from "@/locales/es/translation.json";

/**
 * Recursively extracts all dot-separated key paths from a nested object.
 * E.g. { a: { b: "v" } } → ["a.b"]
 */
function extractKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    return v && typeof v === "object" && !Array.isArray(v)
      ? extractKeys(v as Record<string, unknown>, key)
      : [key];
  });
}

describe("Locale parity — EN ↔ ES", () => {
  const enKeys = new Set(extractKeys(en));
  const esKeys = new Set(extractKeys(es));

  it("should have no keys present in EN that are missing from ES", () => {
    const missingInEs = [...enKeys].filter((k) => !esKeys.has(k));
    expect(missingInEs).toEqual([]);
  });

  it("should have no keys present in ES that are missing from EN", () => {
    const missingInEn = [...esKeys].filter((k) => !enKeys.has(k));
    expect(missingInEn).toEqual([]);
  });
});
