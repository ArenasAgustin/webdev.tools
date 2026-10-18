import { afterEach, describe, expect, it, vi } from "vitest";
import {
  UrlError,
  decodeUrl,
  defaultUrlOptions,
  encodeUrl,
  isLikelyUrlEncoded,
  isUrlMode,
  isUrlVariant,
  normalizeUrlOptions,
  resolveMode,
  type UrlErrorCode,
  type UrlVariant,
} from "./url.utils";

const VARIANTS: UrlVariant[] = ["component", "uri", "form"];

describe("encodeUrl", () => {
  it("encodes component variant", () => {
    expect(encodeUrl("a b&c=d/é", "component")).toBe("a%20b%26c%3Dd%2F%C3%A9");
  });

  it("encodes uri variant keeping reserved characters", () => {
    expect(encodeUrl("a b&c=d/é", "uri")).toBe("a%20b&c=d/%C3%A9");
    expect(encodeUrl("https://x.io/p?q=1#h", "uri")).toBe("https://x.io/p?q=1#h");
  });

  it("encodes form variant with plus for spaces", () => {
    expect(encodeUrl("a b&c=d/é", "form")).toBe("a+b%26c%3Dd%2F%C3%A9");
  });

  it.each(VARIANTS)("round-trips emoji as UTF-8 in %s", (variant) => {
    const encoded = encodeUrl("😀", variant);
    expect(encoded).toBe("%F0%9F%98%80");
    expect(decodeUrl(encoded, variant)).toBe("😀");
  });

  it.each(VARIANTS)("returns empty string for empty input in %s", (variant) => {
    expect(encodeUrl("", variant)).toBe("");
  });

  it("leaves !'()~ unescaped when not strict", () => {
    expect(encodeUrl("a!b'c(d)e~", "component")).toBe("a!b'c(d)e~");
    expect(encodeUrl("a!b'c(d)e~", "form")).toBe("a!b'c(d)e~");
  });

  describe("strict", () => {
    it("escapes !'()* for component", () => {
      expect(encodeUrl("a!b'c(d)e*", "component", { strict: true })).toBe("a%21b%27c%28d%29e%2A");
      expect(encodeUrl("a!b'c(d)e*", "component")).toBe("a!b'c(d)e*");
    });

    it("escapes !'()* for form", () => {
      expect(encodeUrl("a b!", "form", { strict: true })).toBe("a+b%21");
    });

    it("ignores strict for uri", () => {
      expect(encodeUrl("a!b", "uri", { strict: true })).toBe("a!b");
    });
  });
});

describe("decodeUrl", () => {
  it("decodes component variant", () => {
    expect(decodeUrl("a%20b%26c%3Dd%2F%C3%A9", "component")).toBe("a b&c=d/é");
  });

  it("preserves plus in component", () => {
    expect(decodeUrl("a+b", "component")).toBe("a+b");
  });

  it("turns plus into space in form but keeps %2B as plus", () => {
    expect(decodeUrl("a+b%2Bc", "form")).toBe("a b+c");
  });

  it("decodes uri variant", () => {
    expect(decodeUrl("a%20b&c=d/%C3%A9", "uri")).toBe("a b&c=d/é");
  });

  it("keeps reserved escapes encoded in uri", () => {
    expect(decodeUrl("%2F%20a", "uri")).toBe("%2F a");
  });

  it.each(VARIANTS)("returns empty string for empty input in %s", (variant) => {
    expect(decodeUrl("", variant)).toBe("");
  });

  it("is lenient with unencoded characters", () => {
    expect(decodeUrl("a b%20c", "component")).toBe("a b c");
  });

  it("decodes %21 regardless of strict-style input", () => {
    expect(decodeUrl("%21", "component")).toBe("!");
  });
});

describe("errors", () => {
  it.each([
    ["%", "component"],
    ["%E0%A4%A", "component"],
    ["%zz", "component"],
    ["%E0%A4", "component"],
    ["%zz", "uri"],
    ["a+%", "form"],
  ] as [string, UrlVariant][])("decode %j (%s) throws malformedSequence", (input, variant) => {
    const run = () => decodeUrl(input, variant);
    expect(run).toThrow(UrlError);
    try {
      run();
    } catch (error) {
      expect((error as UrlError).code).toBe("malformedSequence");
    }
  });

  it.each(VARIANTS)("encode lone surrogate throws invalidSurrogate in %s", (variant) => {
    try {
      encodeUrl("\uD800", variant);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(UrlError);
      expect((error as UrlError).code).toBe("invalidSurrogate");
    }
  });

  it.each([
    ["malformedSequence", "Input contains a malformed percent-encoded sequence"],
    ["invalidSurrogate", "Input contains an unpaired UTF-16 surrogate"],
  ] as [UrlErrorCode, string][])("UrlError(%s) has name, code and message", (code, message) => {
    const error = new UrlError(code);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(UrlError);
    expect(error.name).toBe("UrlError");
    expect(error.code).toBe(code);
    expect(error.message).toBe(message);
  });

  describe("non-URIError", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("rethrows unexpected errors from encode", () => {
      vi.spyOn(globalThis, "encodeURIComponent").mockImplementation(() => {
        throw new TypeError("boom");
      });
      expect(() => encodeUrl("a", "component")).toThrow(TypeError);
    });

    it("rethrows unexpected errors from decode", () => {
      vi.spyOn(globalThis, "decodeURIComponent").mockImplementation(() => {
        throw new TypeError("boom");
      });
      expect(() => decodeUrl("a", "component")).toThrow(TypeError);
    });
  });
});

describe("isLikelyUrlEncoded", () => {
  it.each([
    ["a%20b", "component", true],
    ["%41", "component", true],
    ["hello world", "component", false],
    ["a b%20c", "component", false],
    ["a%20b\tc", "component", false],
    ["a%20b\nc", "component", false],
    ["plain", "component", false],
    ["%zz", "component", false],
    ["100%", "component", false],
    ["", "component", false],
    ["a+b", "component", false],
    ["a+b", "form", true],
    ["a+b\n", "form", false],
  ] as [string, UrlVariant, boolean][])("%j (%s) -> %s", (input, variant, expected) => {
    expect(isLikelyUrlEncoded(input, variant)).toBe(expected);
  });
});

describe("resolveMode", () => {
  it("returns explicit modes unchanged", () => {
    expect(resolveMode("encode", "a%20b", "component")).toBe("encode");
    expect(resolveMode("decode", "plain", "component")).toBe("decode");
  });

  it("auto-detects direction", () => {
    expect(resolveMode("auto", "a%20b", "component")).toBe("decode");
    expect(resolveMode("auto", "a b", "component")).toBe("encode");
    expect(resolveMode("auto", "", "component")).toBe("encode");
  });
});

describe("type guards", () => {
  it.each(["auto", "encode", "decode"])("isUrlMode accepts %s", (value) => {
    expect(isUrlMode(value)).toBe(true);
  });

  it.each(["component", "uri", "form"])("isUrlVariant accepts %s", (value) => {
    expect(isUrlVariant(value)).toBe(true);
  });

  it.each(["foo", "", null, undefined, 1, {}, "AUTO"])("rejects %j", (value) => {
    expect(isUrlMode(value)).toBe(false);
    expect(isUrlVariant(value)).toBe(false);
  });
});

describe("normalizeUrlOptions", () => {
  it.each([true, false])("keeps boolean strict=%s", (strict) => {
    expect(normalizeUrlOptions({ strict })).toEqual({ strict });
  });

  it.each([null, undefined, "x", [], {}, { strict: "yes" }])(
    "falls back to defaults for %j",
    (value) => {
      expect(normalizeUrlOptions(value)).toEqual(defaultUrlOptions);
    },
  );

  it("drops extra keys", () => {
    expect(normalizeUrlOptions({ strict: true, extra: 1 })).toEqual({ strict: true });
  });

  it("returns a fresh object", () => {
    expect(normalizeUrlOptions(null)).not.toBe(defaultUrlOptions);
  });
});
