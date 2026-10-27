/**
 * Base transform service contract for synchronous transformations.
 */

import type { Result } from "@/types/common";
import { localizeServiceMessage } from "@/services/localizeServiceMessage";

export type MaybePromise<T> = T | Promise<T>;

/** Canonical transform function contract for all playground services */
export type TransformFn<TOptions, TError> = (
  input: string,
  options?: TOptions,
) => MaybePromise<Result<string, TError>>;

export type ValidateFn<TError> = (input: string) => MaybePromise<Result<void, TError>>;

/**
 * Generic transform interface for services (format, minify, clean, etc).
 */
export interface TransformService<TOptions, TError> {
  transform: TransformFn<TOptions, TError>;
}

export interface PlaygroundTransformService<
  TFormatOptions,
  TMinifyOptions,
  TTransformError,
  TValidateError = TTransformError,
> {
  format: TransformFn<TFormatOptions, TTransformError>;
  minify: TransformFn<TMinifyOptions, TTransformError>;
  validate: ValidateFn<TValidateError>;
}

/**
 * Factory para crear un PlaygroundTransformService estándar a partir de funciones
 * de worker async que devuelven `Result<string, { message: string }>`.
 *
 * Elimina el boilerplate de `result.ok ? result : { ok: false, error: result.error.message }`
 * repetido en cada service.ts.
 */
export function createPlaygroundService<TFormat, TMinify>(config: {
  format: (input: string, options?: TFormat) => Promise<Result<string, { message: string }>>;
  minify: (input: string, options?: TMinify) => Promise<Result<string, { message: string }>>;
  /** `services.*` key (see `serviceMessage`) reported when the input is blank. */
  emptyMessage: `services.${string}`;
  validate?: ValidateFn<string>;
}): PlaygroundTransformService<TFormat, TMinify, string> {
  // Transforms may hand back locale-neutral message keys; this is the main-thread
  // boundary where they become user-facing text.
  const validate = config.validate;
  return {
    format: async (input, options) => {
      const result = await config.format(input, options);
      return result.ok ? result : { ok: false, error: localizeServiceMessage(result.error.message) };
    },
    minify: async (input, options) => {
      const result = await config.minify(input, options);
      return result.ok ? result : { ok: false, error: localizeServiceMessage(result.error.message) };
    },
    validate: validate
      ? (input) => {
          const result = validate(input);
          return result instanceof Promise
            ? result.then(localizeValidation)
            : localizeValidation(result);
        }
      : createNonEmptyValidator(() => localizeServiceMessage(config.emptyMessage)),
  };
}

function localizeValidation(result: Result<void, string>): Result<void, string> {
  return result.ok ? result : { ok: false, error: localizeServiceMessage(result.error) };
}

export function createNonEmptyValidator<TError>(errorFactory: () => TError): ValidateFn<TError> {
  return (input: string) => {
    if (!input.trim()) {
      return {
        ok: false,
        error: errorFactory(),
      };
    }

    return {
      ok: true,
      value: undefined,
    };
  };
}
