import { useEffect, useState } from "react";
import { validateSqlAsync } from "@/services/sql/worker";
import { compactTransformError } from "@/utils/transformError";

export interface SqlParserState {
  valid: boolean;
  error: string | null;
  parsing: boolean;
}

const EMPTY: SqlParserState = { valid: false, error: null, parsing: false };

interface InternalState {
  validatedSource: string | null;
  valid: boolean;
  error: string | null;
}

const INTERNAL_EMPTY: InternalState = { validatedSource: null, valid: false, error: null };

export function useSqlParser(input: string): SqlParserState {
  const source = input.trim();
  const [internal, setInternal] = useState<InternalState>(INTERNAL_EMPTY);

  useEffect(() => {
    if (!source) return;

    let cancelled = false;

    void validateSqlAsync(source)
      .then((result) => {
        if (cancelled) return;

        if (result.ok) {
          setInternal({ validatedSource: source, valid: true, error: null });
        } else {
          setInternal({
            validatedSource: source,
            valid: false,
            error: `Error de sintaxis: ${compactTransformError(result.error ?? "SQL inválido")}`,
          });
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;

        const message = err instanceof Error ? err.message : String(err);
        setInternal({
          validatedSource: source,
          valid: false,
          error: `Error de sintaxis: ${compactTransformError(message)}`,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [source]);

  if (!source) return EMPTY;

  // parsing is true when we have a non-empty source but haven't received the result yet
  const parsing = internal.validatedSource !== source;

  return {
    valid: parsing ? false : internal.valid,
    error: parsing ? null : internal.error,
    parsing,
  };
}
