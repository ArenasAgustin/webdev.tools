import { useState } from "react";

export function useMergedConfigState<TConfig extends object>(
  defaults: TConfig,
  saved?: Partial<TConfig> | null,
) {
  const [config, setConfig] = useState<TConfig>(() => ({
    ...defaults,
    ...(saved ?? {}),
  }));

  return [config, setConfig] as const;
}
