import { useState } from "react";

export function useMergedConfigState<TConfig extends object>(
  defaults: TConfig,
  saved?: Partial<TConfig> | null,
) {
  return useState<TConfig>(() => ({
    ...defaults,
    ...(saved ?? {}),
  }));
}
