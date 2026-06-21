import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { getItem, setItem } from "@/services/storage";
import { useDebouncedValue } from "./useDebouncedValue";

/**
 * A generic hook that mirrors useState but persists the value to localStorage.
 * Reads from storage once on init (lazy initializer), then debounces writes
 * via the existing useDebouncedValue hook.
 *
 * Does NOT access localStorage directly — delegates to getItem/setItem.
 *
 * Flush-on-unmount: a separate cleanup-only effect keyed on [key] writes the
 * latest in-memory value synchronously when the component unmounts, ensuring
 * no data is lost if unmount happens before the debounce fires.
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  debounceMs = 300,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => getItem<T>(key) ?? defaultValue);
  const debouncedValue = useDebouncedValue(value, debounceMs);

  // Track the live value so the unmount-flush effect always sees the latest.
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Debounced write — normal operation path.
  useEffect(() => {
    setItem(key, debouncedValue);
  }, [key, debouncedValue]);

  // Flush-on-unmount: keyed on [key] so it only runs the cleanup on unmount
  // (not on every value change). Writes valueRef.current which always holds
  // the latest state, even within the debounce window.
  useEffect(() => {
    return () => {
      setItem(key, valueRef.current);
    };
  }, [key]);

  return [value, setValue];
}
