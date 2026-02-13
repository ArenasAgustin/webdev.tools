import { useContext } from "react";
import { ToastContext } from "@/context/toast.context";

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return {
    success: (message: string, duration?: number) => context.addToast(message, "success", duration),
    error: (message: string, duration?: number) => context.addToast(message, "error", duration),
    info: (message: string, duration?: number) => context.addToast(message, "info", duration),
  };
}
