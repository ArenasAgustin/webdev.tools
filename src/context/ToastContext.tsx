import { useState, useCallback, type ReactNode } from "react";
import { ToastContext, type Toast, type ToastVariant } from "./toast.context";

export { type ToastVariant, type Toast } from "./toast.context";

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, variant: ToastVariant, duration?: number) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `toast-${Date.now()}-${Math.random()}`;
    const resolvedDuration = duration ?? 3000;

    const newToast: Toast = { id, message, variant, duration: resolvedDuration };

    setToasts((prev) => {
      const updated = [newToast, ...prev];
      if (updated.length > 3) {
        updated.pop();
      }
      return updated;
    });
  }, []);

  return (
    <ToastContext value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext>
  );
}
