import { useState, useCallback, useEffect, type ReactNode } from "react";
import { ToastContext, type Toast, type ToastVariant } from "./toast.context";

export { type ToastVariant, type Toast } from "./toast.context";

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, variant: ToastVariant, duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const resolvedDuration = duration ?? 3000;

    const newToast: Toast = { id, message, variant, duration: resolvedDuration };

    setToasts((prev) => {
      // Add new toast to the beginning (newest on top)
      const updated = [newToast, ...prev];

      // Limit to 6 toasts maximum
      if (updated.length > 6) {
        // Remove the oldest toast (which is now at the end)
        updated.pop();
        return updated;
      }

      return updated;
    });
  }, []);

  // Auto-dismiss toasts after their duration
  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) => {
      // eslint-disable-next-line @eslint-react/web-api-no-leaked-timeout -- every timer is collected in `timers` and cleared in the cleanup below
      const timerId = setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);
      return timerId;
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [toasts, removeToast]);

  return (
    <ToastContext value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext>
  );
}
