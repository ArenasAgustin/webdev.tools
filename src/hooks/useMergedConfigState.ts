import { useState } from "react";

/**
 * Merges default and saved configuration, returning a stateful config object.
 * @param defaults - Default configuration values
 * @param saved - Saved configuration values (e.g. from localStorage)
 *
 * @note This hook does not sync external changes to localStorage. If the saved
 * configuration changes externally (e.g. in another tab), the state will not
 * update automatically. This is a known limitation.
 */
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
