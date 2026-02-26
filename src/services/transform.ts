/**
 * Base transform service contract for synchronous transformations.
 */

import type { Result } from "@/types/common";

/**
 * Generic transform interface for services (format, minify, clean, etc).
 */
export interface TransformService<TOptions, TError> {
  transform:
    | ((input: string, options?: TOptions) => Result<string, TError>)
    | ((input: string, options?: TOptions) => Promise<Result<string, TError>>);
}
