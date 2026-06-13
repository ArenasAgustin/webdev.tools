import { useEffect, useRef } from "react";

/**
 * Runs a callback during the browser's idle period (requestIdleCallback),
 * with a fallback to setTimeout when the API is unavailable.
 * The callback is called once on mount and never re-runs.
 */
export function useIdleCallback(fn: () => void, opts?: IdleRequestOptions): void {
  const fnRef = useRef(fn);
  const optsRef = useRef(opts);

  useEffect(() => {
    fnRef.current = fn;
    optsRef.current = opts;
  });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let idleId: number | null = null;

    const callback = () => {
      fnRef.current();
    };

    const opts = optsRef.current;
    const requestIdle = globalThis.requestIdleCallback;
    const cancelIdle = globalThis.cancelIdleCallback;

    if (typeof requestIdle === "function") {
      idleId = requestIdle(callback, opts);
    } else {
      timeoutId = globalThis.setTimeout(callback, opts?.timeout ?? 200);
    }

    return () => {
      if (idleId !== null && typeof cancelIdle === "function") {
        cancelIdle(idleId);
      }
      if (timeoutId !== null) {
        globalThis.clearTimeout(timeoutId);
      }
    };
  }, []);
}
