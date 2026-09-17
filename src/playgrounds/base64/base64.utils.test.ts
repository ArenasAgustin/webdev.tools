// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  encode,
  encodeText,
  decode,
  decodeText,
  isLikelyBase64,
  resolveMode,
  Base64Error,
} from "./base64.utils";

describe("base64.utils", () => {
  describe("round-trip encodeText/decodeText", () => {
    it.each([
      ["ascii", "Hello, World!"],
      ["accented", "café con leche, mañana"],
      ["cjk", "日本語のテキスト"],
      ["emoji", "🎉🚀✨"],
      ["empty", ""],
    ])("round-trips %s text", (_label, text) => {
      expect(decodeText(encodeText(text))).toBe(text);
    });

    it("matches the known standard encoding for a fixed string", () => {
      expect(encodeText("Hello World")).toBe("SGVsbG8gV29ybGQ=");
    });
  });

  describe("chunked codec for large input", () => {
    it("encodes and decodes a 5MB payload without throwing", () => {
      const bytes = new Uint8Array(5 * 1024 * 1024).fill(65);
      expect(() => encode(bytes)).not.toThrow();
      const encoded = encode(bytes);
      const decoded = decode(encoded);
      expect(decoded.length).toBe(bytes.length);
      expect(decoded[0]).toBe(65);
      expect(decoded[decoded.length - 1]).toBe(65);
    });
  });

  describe("url-safe / padding options", () => {
    it("emits -/_ in url-safe mode and decode accepts both alphabets", () => {
      const bytes = new Uint8Array([0xfb, 0xff, 0xbf]);
      const standard = encode(bytes, { urlSafe: false });
      const urlSafe = encode(bytes, { urlSafe: true });

      expect(standard).toContain("+");
      expect(standard).toContain("/");
      expect(urlSafe).not.toMatch(/[+/]/);
      expect(urlSafe).toBe(standard.replace(/\+/g, "-").replace(/\//g, "_"));
      expect(Array.from(decode(urlSafe))).toEqual(Array.from(bytes));
      expect(Array.from(decode(standard))).toEqual(Array.from(bytes));
    });

    it("omits padding when configured and decode re-pads correctly", () => {
      const text = "Hi";
      const withPadding = encodeText(text, { padding: true });
      const withoutPadding = encodeText(text, { padding: false });

      expect(withoutPadding).toBe(withPadding.replace(/=+$/, ""));
      expect(decodeText(withoutPadding)).toBe(text);
    });
  });

  describe("decode error handling", () => {
    it("throws invalidCharacter for a character outside the alphabet", () => {
      expect(() => decode("abc$")).toThrow(Base64Error);
      try {
        decode("abc$");
        expect.unreachable("decode should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(Base64Error);
        expect((error as Base64Error).code).toBe("invalidCharacter");
      }
    });

    it("throws invalidCharacter when '=' appears inside the body", () => {
      try {
        decode("ab=cd");
        expect.unreachable("decode should have thrown");
      } catch (error) {
        expect((error as Base64Error).code).toBe("invalidCharacter");
      }
    });

    it("throws invalidPadding for more than two trailing '=' characters", () => {
      try {
        decode("QQ===");
        expect.unreachable("decode should have thrown");
      } catch (error) {
        expect((error as Base64Error).code).toBe("invalidPadding");
      }
    });

    it("throws invalidLength when the body length is 1 mod 4", () => {
      try {
        decode("QQQQQ");
        expect.unreachable("decode should have thrown");
      } catch (error) {
        expect((error as Base64Error).code).toBe("invalidLength");
      }
    });

    it("throws invalidUtf8 when decoded bytes are not valid UTF-8", () => {
      const invalidUtf8Base64 = encode(new Uint8Array([0xff]));
      try {
        decodeText(invalidUtf8Base64);
        expect.unreachable("decodeText should have thrown");
      } catch (error) {
        expect((error as Base64Error).code).toBe("invalidUtf8");
      }
    });
  });

  describe("whitespace tolerance", () => {
    it("strips whitespace before decoding", () => {
      expect(decodeText("SGVsbG8g\nV29ybGQ=")).toBe("Hello World");
    });

    it("returns an empty array for an empty (or all-whitespace) input", () => {
      expect(decode("")).toEqual(new Uint8Array(0));
      expect(decode("  \n\t")).toEqual(new Uint8Array(0));
    });
  });

  describe("isLikelyBase64", () => {
    it.each([
      ["padded standard base64", "SGVsbG8gV29ybGQ="],
      ["unpadded standard base64", "SGVsbG8gV29ybGQ"],
      ["url-safe base64", "abc123-_"],
      ["whitespace-wrapped base64", "SGVsbG8g\nV29ybGQ="],
    ])("returns true for %s", (_label, value) => {
      expect(isLikelyBase64(value)).toBe(true);
    });

    it.each([
      ["a plain lowercase word", "password"],
      ["plain text with a space", "Hello World"],
      ["a too-short string", "abc"],
      ["mixed standard and url-safe alphabets", "abcd1234+_"],
      ["a too-short unpadded string", "abcde"],
    ])("returns false for %s", (_label, value) => {
      expect(isLikelyBase64(value)).toBe(false);
    });
  });

  describe("resolveMode", () => {
    it("returns the explicit mode when not auto", () => {
      expect(resolveMode("encode", "SGVsbG8gV29ybGQ=")).toBe("encode");
      expect(resolveMode("decode", "plain text")).toBe("decode");
    });

    it("derives the mode from isLikelyBase64 when auto", () => {
      expect(resolveMode("auto", "SGVsbG8gV29ybGQ=")).toBe("decode");
      expect(resolveMode("auto", "Hello World")).toBe("encode");
    });
  });
});
