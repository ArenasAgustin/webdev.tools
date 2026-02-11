import { useContext } from "react";
import { Toast } from "./Toast";
import { ToastContext } from "@/context/toast.context";

export function ToastContainer() {
  const context = useContext(ToastContext);

  if (!context) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4  z-50 flex flex-col-reverse gap-2 pointer-events-none">
      {context.toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            message={toast.message}
            variant={toast.variant}
            duration={toast.duration}
            onRemove={() => context.removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}
