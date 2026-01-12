// Common Result type for error handling
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

// JSON types
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

// JSON error type
export interface JsonError {
  message: string;
  line?: number;
  column?: number;
}
