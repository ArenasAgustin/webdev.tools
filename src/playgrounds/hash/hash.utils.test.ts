import { describe, it, expect } from "vitest";
import { generateAllHashes, generateHash, compareHash } from "./hash.utils";

describe("hash.utils", () => {
  describe("generateHash", () => {
    it("MD5 no está disponible (usar SHA-256)", async () => {
      const hash = await generateHash("hello", "md5");
      expect(hash).toBe("No disponible");
    });

    it("generates SHA-1 hash", async () => {
      const hash = await generateHash("hello", "sha1");
      expect(hash).toHaveLength(40);
    });

    it("generates SHA-256 hash", async () => {
      const hash = await generateHash("hello", "sha256");
      expect(hash).toHaveLength(64);
    });

    it("generates SHA-512 hash", async () => {
      const hash = await generateHash("hello", "sha512");
      expect(hash).toHaveLength(128);
    });

    it("respects output case", async () => {
      const lower = await generateHash("hello", "sha256", "lowercase");
      const upper = await generateHash("hello", "sha256", "uppercase");
      expect(lower).toBe(lower.toLowerCase());
      expect(upper).toBe(upper.toUpperCase());
    });
  });

  describe("generateAllHashes", () => {
    it("generates SHA hashes (MD5 no disponible)", async () => {
      const results = await generateAllHashes("hello");
      // MD5 returns "No disponible", pero los SHA siguen funcionando
      expect(results.length).toBeGreaterThanOrEqual(3);
      expect(results.map((r) => r.algorithm)).toContain("sha1");
      expect(results.map((r) => r.algorithm)).toContain("sha256");
      expect(results.map((r) => r.algorithm)).toContain("sha512");
    });
  });

  describe("compareHash", () => {
    it("returns false for non-matching hash", async () => {
      const result = await compareHash("hello", "wronghash", "md5");
      expect(result).toBe(false);
    });
  });
});
