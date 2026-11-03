import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { getItem, removeItem, setItem } from "@/services/storage";
import { useDebouncedValue } from "./useDebouncedValue";

export interface PersistedStateOptions {
  debounceMs?: number;
  /** Longest string value that is saved; longer ones stay in memory only. */
  maxLength?: number;
}

/** Write `value` under `key`, honoring `maxLength`; returns whether it was saved. */
function persist<T>(key: string, value: T, maxLength: number | undefined): boolean {
  if (maxLength !== undefined && typeof value === "string" && value.length > maxLength) {
    removeItem(key);
    return false;
  }
  return setItem(key, value);
}

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
 * The same write runs on pagehide / visibilitychange to hidden, since closing
 * or reloading the tab does not unmount.
 *
 * The third element is true while the latest debounced value could not be
 * saved (e.g. it exceeds the storage quota), so the caller can tell the user it
 * will not survive a reload.
 *
 * `maxLength` caps string values: a longer one is not written at all (so one
 * tool cannot fill the quota shared with the others) and its previous, now
 * outdated copy is removed so a reload does not bring it back.
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  options: number | PersistedStateOptions = {},
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const { debounceMs = 300, maxLength } =
    typeof options === "number" ? { debounceMs: options } : options;
  const [value, setValue] = useState<T>(() => getItem<T>(key) ?? defaultValue);
  const debouncedValue = useDebouncedValue(value, debounceMs);
  const [persistFailed, setPersistFailed] = useState(false);

  // Track the live value so the unmount-flush effect always sees the latest.
  const valueRef = useRef(value);
  const maxLengthRef = useRef(maxLength);
  useEffect(() => {
    valueRef.current = value;
    maxLengthRef.current = maxLength;
  }, [value, maxLength]);

  // Debounced write — normal operation path.
  useEffect(() => {
    const saved = persist(key, debouncedValue, maxLength);
    // eslint-disable-next-line react-hooks/set-state-in-effect, @eslint-react/set-state-in-effect -- the outcome of the localStorage write is only known after it runs
    setPersistFailed(!saved);
  }, [key, debouncedValue, maxLength]);

  // Closing or reloading the tab does not unmount React, so a value typed within
  // the debounce window would be lost: save it when the page is hidden or left.
  useEffect(() => {
    const flush = () => {
      persist(key, valueRef.current, maxLengthRef.current);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [key]);

  // Flush-on-unmount: keyed on [key] so it only runs the cleanup on unmount
  // (not on every value change). Writes valueRef.current which always holds
  // the latest state, even within the debounce window.
  useEffect(() => {
    return () => {
      persist(key, valueRef.current, maxLengthRef.current);
    };
  }, [key]);

  return [value, setValue, persistFailed];
}
