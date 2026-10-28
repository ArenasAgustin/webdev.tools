export type UrlVariant = "component" | "uri" | "form";

export type UrlMode = "auto" | "encode" | "decode";

export type UrlErrorCode = "malformedSequence" | "invalidSurrogate";

export interface UrlOptions {
  strict: boolean;
}

export const defaultUrlOptions: UrlOptions = { strict: false };

const URL_MODES = ["auto", "encode", "decode"] as const satisfies readonly UrlMode[];
const URL_VARIANTS = ["component", "uri", "form"] as const satisfies readonly UrlVariant[];

export function isUrlMode(value: unknown): value is UrlMode {
  return typeof value === "string" && (URL_MODES as readonly string[]).includes(value);
}

export function isUrlVariant(value: unknown): value is UrlVariant {
  return typeof value === "string" && (URL_VARIANTS as readonly string[]).includes(value);
}

/**
 * Coerce an untrusted persisted value into UrlOptions. Returns a fresh object;
 * non-objects, arrays and non-boolean `strict` fall back to defaults. Unknown keys are dropped.
 */
export function normalizeUrlOptions(value: unknown): UrlOptions {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { ...defaultUrlOptions };
  }
  const strict = (value as Record<string, unknown>).strict;
  return { strict: typeof strict === "boolean" ? strict : defaultUrlOptions.strict };
}

const ERROR_MESSAGES: Record<UrlErrorCode, string> = {
  malformedSequence: "Input contains a malformed percent-encoded sequence",
  invalidSurrogate: "Input contains an unpaired UTF-16 surrogate",
};

export class UrlError extends Error {
  readonly code: UrlErrorCode;

  constructor(code: UrlErrorCode) {
    super(ERROR_MESSAGES[code]);
    this.name = "UrlError";
    this.code = code;
  }
}

function toPercentHex(char: string): string {
  return "%" + char.charCodeAt(0).toString(16).toUpperCase();
}

/**
 * Percent-encode text for the given variant.
 * The `form` variant matches the WHATWG application/x-www-form-urlencoded serializer
 * (URLSearchParams): spaces become `+` and `~!'()` are escaped; only `*-._` stay raw.
 * `strict` escapes `!'()*` for `component` and `form`; it is ignored for `uri`.
 * The `uri` variant keeps existing valid `%XX` escapes (like the WHATWG URL parser),
 * so encoding a partially encoded URL does not double-encode them.
 */
export function encodeUrl(text: string, variant: UrlVariant, opts?: Partial<UrlOptions>): string {
  const { strict } = { ...defaultUrlOptions, ...opts };

  let result: string;
  try {
    result =
      variant === "uri"
        ? text
            .split(/(%[0-9A-Fa-f]{2})/)
            .map((part, index) => (index % 2 === 1 ? part : encodeURI(part)))
            .join("")
        : encodeURIComponent(text);
  } catch (error) {
    if (error instanceof URIError) {
      throw new UrlError("invalidSurrogate");
    }
    throw error;
  }

  if (variant === "form") {
    result = result.replace(/[~!'()]/g, toPercentHex).replace(/%20/g, "+");
  }
  if (strict && variant !== "uri") {
    result = result.replace(/[!'()*]/g, toPercentHex);
  }
  return result;
}

/** Lenient percent-decoding: unencoded characters pass through; `form` maps `+` to space. */
export function decodeUrl(input: string, variant: UrlVariant): string {
  const source = variant === "form" ? input.replace(/\+/g, " ") : input;
  try {
    return variant === "uri" ? decodeURI(source) : decodeURIComponent(source);
  } catch (error) {
    if (error instanceof URIError) {
      throw new UrlError("malformedSequence");
    }
    throw error;
  }
}

/**
 * Heuristic used by auto mode. Any whitespace means plain text, since encoded output
 * never contains raw whitespace. Literal text like "%41" is detected as encoded
 * (documented limitation; explicit modes override).
 * Without `%XX` escapes, a `+` only counts as form data when the whole input could be
 * form-encoder output (unreserved characters and `+`); text like "1+1=2" holds `=`,
 * which the encoder would have escaped, so it is plain text.
 */
export function isLikelyUrlEncoded(input: string, variant: UrlVariant): boolean {
  if (input === "" || /\s/.test(input)) {
    return false;
  }
  if (/%[0-9A-Fa-f]{2}/.test(input)) {
    return true;
  }
  return variant === "form" && input.includes("+") && /^[A-Za-z0-9\-_.!~*'()+]+$/.test(input);
}

/** Resolve the effective encode/decode direction from mode + current input. */
export function resolveMode(
  mode: UrlMode,
  input: string,
  variant: UrlVariant,
): "encode" | "decode" {
  if (mode === "auto") {
    return isLikelyUrlEncoded(input, variant) ? "decode" : "encode";
  }
  return mode;
}
