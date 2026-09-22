export interface Base64Options {
  urlSafe: boolean;
  padding: boolean;
}

export const defaultBase64Options: Base64Options = {
  urlSafe: false,
  padding: true,
};

export type Base64Mode = "auto" | "encode" | "decode";

export type Base64InputMode = "text" | "file";

export type Base64ErrorCode =
  | "invalidCharacter"
  | "invalidLength"
  | "invalidPadding"
  | "invalidUtf8";

const ERROR_MESSAGES: Record<Base64ErrorCode, string> = {
  invalidCharacter: "Input contains a character outside the Base64 alphabet",
  invalidLength: "Input length is not a valid Base64 length",
  invalidPadding: "Input has invalid Base64 padding",
  invalidUtf8: "Decoded bytes are not valid UTF-8 text",
};

export class Base64Error extends Error {
  readonly code: Base64ErrorCode;

  constructor(code: Base64ErrorCode) {
    super(ERROR_MESSAGES[code]);
    this.name = "Base64Error";
    this.code = code;
  }
}

/** Max chunk size passed to String.fromCharCode.apply to avoid call-stack overflow. */
const CHUNK_SIZE = 0x8000;

/**
 * Convert raw bytes to a Base64 string.
 * Processes bytes in fixed-size chunks so large payloads never hit engine
 * call-argument limits (String.fromCharCode.apply on the full array).
 */
export function encode(bytes: Uint8Array, opts?: Partial<Base64Options>): string {
  const { urlSafe, padding } = { ...defaultBase64Options, ...opts };

  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE);
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }

  let result = btoa(binary);

  if (urlSafe) {
    result = result.replace(/\+/g, "-").replace(/\//g, "_");
  }
  if (!padding) {
    result = result.replace(/=+$/, "");
  }

  return result;
}

/** UTF-8-safe text encoding — never call btoa on a raw JS string. */
export function encodeText(text: string, opts?: Partial<Base64Options>): string {
  return encode(new TextEncoder().encode(text), opts);
}

/**
 * Decode a Base64 string to raw bytes.
 * Lenient by design: accepts both standard and url-safe alphabets and strips
 * whitespace, regardless of the encode-side options used to produce it.
 */
export function decode(str: string): Uint8Array {
  const stripped = str.replace(/\s+/g, "");
  if (stripped.length === 0) {
    return new Uint8Array(0);
  }

  const standardized = stripped.replace(/-/g, "+").replace(/_/g, "/");

  const paddingMatch = /=*$/.exec(standardized);
  const trailingPadding = paddingMatch ? paddingMatch[0] : "";
  const body = standardized.slice(0, standardized.length - trailingPadding.length);

  if (body.includes("=")) {
    throw new Base64Error("invalidCharacter");
  }
  if (trailingPadding.length > 2) {
    throw new Base64Error("invalidPadding");
  }
  if (!/^[A-Za-z0-9+/]*$/.test(body)) {
    throw new Base64Error("invalidCharacter");
  }
  if (body.length % 4 === 1) {
    throw new Base64Error("invalidLength");
  }
  if (trailingPadding.length > 0 && (body.length + trailingPadding.length) % 4 !== 0) {
    throw new Base64Error("invalidPadding");
  }

  const remainder = body.length % 4;
  const repadded = remainder === 0 ? body : body + "=".repeat(4 - remainder);

  let binary: string;
  try {
    binary = atob(repadded);
  } catch {
    throw new Base64Error("invalidCharacter");
  }

  const decoded = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    decoded[i] = binary.charCodeAt(i);
  }
  return decoded;
}

/** UTF-8-safe text decoding — throws Base64Error("invalidUtf8") on malformed bytes. */
export function decodeText(str: string): string {
  const bytes = decode(str);
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Base64Error("invalidUtf8");
    }
    throw error;
  }
}

/**
 * Heuristic guess of whether a string is "probably Base64", used to drive
 * auto-detect mode. Errs toward false on plain words / short strings.
 */
export function isLikelyBase64(str: string): boolean {
  const stripped = str.replace(/\s+/g, "");
  if (stripped.length < 8) {
    return false;
  }

  const hasStandardChars = /[+/]/.test(stripped);
  const hasUrlSafeChars = /[-_]/.test(stripped);
  if (hasStandardChars && hasUrlSafeChars) {
    return false;
  }

  const paddingMatch = /=*$/.exec(stripped);
  const padding = paddingMatch ? paddingMatch[0] : "";
  const body = stripped.slice(0, stripped.length - padding.length);

  if (padding.length > 2 || body.includes("=")) {
    return false;
  }

  const alphabetPattern = hasUrlSafeChars ? /^[A-Za-z0-9_-]*$/ : /^[A-Za-z0-9+/]*$/;
  if (!alphabetPattern.test(body)) {
    return false;
  }

  if (padding.length > 0) {
    if ((body.length + padding.length) % 4 !== 0) {
      return false;
    }
  } else if (body.length % 4 === 1) {
    return false;
  }

  const hasPadding = padding.length > 0;
  const hasSpecialChars = hasStandardChars || hasUrlSafeChars;
  const hasDigit = /\d/.test(body);
  const hasBothCases = /[a-z]/.test(body) && /[A-Z]/.test(body);

  return hasPadding || hasSpecialChars || (hasDigit && hasBothCases);
}

/** Resolve the effective encode/decode direction from persisted mode + current input. */
export function resolveMode(mode: Base64Mode, input: string): "encode" | "decode" {
  if (mode === "auto") {
    return isLikelyBase64(input) ? "decode" : "encode";
  }
  return mode;
}
