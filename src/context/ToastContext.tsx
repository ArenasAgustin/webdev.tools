import { useState, useCallback, type ReactNode } from "react";
import { ToastContext, type Toast, type ToastVariant } from "./toast.context";

export { type ToastVariant, type Toast } from "./toast.context";

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, variant: ToastVariant) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const duration = 3000;

      const newToast: Toast = { id, message, variant, duration };

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

      // Auto-dismiss after duration
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}
