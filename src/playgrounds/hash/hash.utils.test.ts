import { describe, it, expect } from "vitest";
import { generateAllHashes, generateHash, compareHash, generateHashFromFile } from "./hash.utils";

describe("hash.utils", () => {
  describe("generateHash", () => {
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
    it("generates SHA hashes", async () => {
      const results = await generateAllHashes("hello");
      expect(results.length).toBe(3);
      expect(results.map((r) => r.algorithm)).toContain("sha1");
      expect(results.map((r) => r.algorithm)).toContain("sha256");
      expect(results.map((r) => r.algorithm)).toContain("sha512");
    });
  });

  describe("compareHash", () => {
    it("returns false for non-matching hash", async () => {
      const result = await compareHash("hello", "wronghash", "sha256");
      expect(result).toBe(false);
    });

    it("returns true for matching hash", async () => {
      // Generate correct hash for "hello" with sha256
      const correctHash = await generateHash("hello", "sha256", "lowercase");
      const result = await compareHash("hello", correctHash, "sha256");
      expect(result).toBe(true);
    });
  });

  describe("generateHashFromFile", () => {
    it("generates hash from File object", async () => {
      const file = new File(["hello"], "test.txt", { type: "text/plain" });
      const hash = await generateHashFromFile(file, "sha256");
      expect(hash).toHaveLength(64);
    });

    it("respects output case for file hash", async () => {
      const file = new File(["hello"], "test.txt", { type: "text/plain" });
      const lower = await generateHashFromFile(file, "sha256", "lowercase");
      const upper = await generateHashFromFile(file, "sha256", "uppercase");
      expect(lower).toBe(lower.toLowerCase());
      expect(upper).toBe(upper.toUpperCase());
    });
  });
});
