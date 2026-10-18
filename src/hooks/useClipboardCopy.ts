import { useState, useCallback, useRef, useEffect } from "react";

interface UseClipboardCopyOptions {
  /** How long `copied` / `error` stay true, in ms. Defaults to 2000. */
  resetMs?: number;
}

interface UseClipboardCopyResult {
  /** Writes `text` to the clipboard. Resolves to true on success; never throws. */
  copy: (text: string) => Promise<boolean>;
  /** Clears both flags and any pending reset timer. */
  reset: () => void;
  copied: boolean;
  error: boolean;
}

export function useClipboardCopy(options?: UseClipboardCopyOptions): UseClipboardCopyResult {
  const resetMs = options?.resetMs ?? 2000;
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setCopied(false);
    setError(false);
  }, [clearTimer]);

  const copy = useCallback(
    async (text: string) => {
      let ok: boolean;
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch (err) {
        console.warn("Clipboard write failed:", err);
        ok = false;
      }
      setCopied(ok);
      setError(!ok);
      clearTimer();
      timerRef.current = setTimeout(reset, resetMs);
      return ok;
    },
    [clearTimer, reset, resetMs],
  );

  return { copy, reset, copied, error };
}
