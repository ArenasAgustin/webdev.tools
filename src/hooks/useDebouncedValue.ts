import { useEffect, useState } from "react";

// Guard against SSR environment where window is not defined
const safelySetTimeout = (callback: () => void, delay: number) => {
  if (typeof setTimeout === 'function') {
    return setTimeout(callback, delay);
  }
  return null;
};

const safelyClearTimeout = (timerId: ReturnType<typeof setTimeout> | null) => {
  if (timerId !== null && typeof clearTimeout === 'function') {
    clearTimeout(timerId);
  }
};

export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Don't schedule timer in SSR environment
    if (typeof window === 'undefined') {
      // In SSR, set state synchronously to avoid cascading renders warning.
      // eslint-disable-next-line react-hooks/set-state-in-effect, @eslint-react/set-state-in-effect -- SSR has no rendering cycle
      setDebouncedValue(value);
      return;
    }

    const timer = safelySetTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => safelyClearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
