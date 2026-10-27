import i18n from "i18next";
import type { Result } from "@/types/common";
import { translate } from "@/i18n/translate";
import { parseServiceMessage } from "@/services/serviceMessage";

/**
 * Main-thread only: turn a message built by `serviceMessage` into localized
 * text. Any other string (library errors, already-translated copy) is returned
 * unchanged, so applying it twice is harmless.
 */
export function localizeServiceMessage(message: string): string {
  const parsed = parseServiceMessage(message);
  if (!parsed || !i18n.exists(parsed.key)) {
    return message;
  }

  return translate(parsed.key, parsed.params);
}

function hasMessage(error: unknown): error is { message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  );
}

/** Localize a string error or the `message` of an error object, keeping its shape. */
export function localizeServiceError<TError>(error: TError): TError {
  if (typeof error === "string") {
    return localizeServiceMessage(error) as TError;
  }

  if (hasMessage(error)) {
    return { ...error, message: localizeServiceMessage(error.message) };
  }

  return error;
}

/** Localize the error branch of a Result; successful results pass through untouched. */
export function localizeServiceResult<TValue, TError>(
  result: Result<TValue, TError>,
): Result<TValue, TError> {
  return result.ok ? result : { ok: false, error: localizeServiceError(result.error) };
}
