/**
 * Base transform service contract for synchronous transformations.
 */

import type { Result } from "@/types/common";

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
