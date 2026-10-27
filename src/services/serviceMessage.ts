/**
 * Locale-neutral service messages.
 *
 * Transforms also run inside web workers, where i18next is not initialized, so
 * they cannot produce translated copy. Instead they return an i18n key under
 * `services.*`, optionally followed by JSON-encoded interpolation params. The
 * main-thread service layer turns it into text with `localizeServiceMessage`.
 *
 * This module must stay free of i18next imports: workers bundle it.
 */

export type ServiceMessageParams = Record<string, string | number>;

export interface ParsedServiceMessage {
  key: string;
  params?: ServiceMessageParams;
}

const KEY_PREFIX = "services.";
// ASCII unit separator: never part of a key and unlikely in library messages.
const PARAMS_SEPARATOR = "\u001F";
const KEY_PATTERN = /^services\.[A-Za-z0-9_.]+$/;

/** Encode a `services.*` i18n key (and its params) as a transportable string. */
export function serviceMessage(key: `services.${string}`, params?: ServiceMessageParams): string {
  return params ? `${key}${PARAMS_SEPARATOR}${JSON.stringify(params)}` : key;
}

/** Decode a string built by `serviceMessage`; returns `null` for any other text. */
export function parseServiceMessage(message: string): ParsedServiceMessage | null {
  if (!message.startsWith(KEY_PREFIX)) {
    return null;
  }

  const separatorIndex = message.indexOf(PARAMS_SEPARATOR);
  const key = separatorIndex === -1 ? message : message.slice(0, separatorIndex);
  if (!KEY_PATTERN.test(key)) {
    return null;
  }

  if (separatorIndex === -1) {
    return { key };
  }

  try {
    const params = JSON.parse(message.slice(separatorIndex + 1)) as unknown;
    if (typeof params !== "object" || params === null || Array.isArray(params)) {
      return null;
    }
    return { key, params: params as ServiceMessageParams };
  } catch {
    return null;
  }
}
