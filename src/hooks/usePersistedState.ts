import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { getItem, setItem } from "@/services/storage";
import { useDebouncedValue } from "./useDebouncedValue";

/**
 * A generic hook that mirrors useState but persists the value to localStorage.
 * Reads from storage once on init (lazy initializer), then debounces writes
 * via the existing useDebouncedValue hook.
 *
 * Does NOT access localStorage directly — delegates to getItem/setItem.
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  debounceMs = 300,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => getItem<T>(key) ?? defaultValue);
  const debouncedValue = useDebouncedValue(value, debounceMs);

  useEffect(() => {
    setItem(key, debouncedValue);
  }, [key, debouncedValue]);

  return [value, setValue];
}
