import { use } from "react";
import { useTranslation } from "react-i18next";
import { Toast } from "./Toast";
import { ToastContext } from "@/context/toast.context";

export function ToastContainer() {
  const { t } = useTranslation();
  const context = use(ToastContext);

  if (!context) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50 pointer-events-none">
      <div
        role="status"
        aria-live="polite"
        aria-label={t("notifications")}
        aria-atomic="false"
        className="flex flex-col gap-2"
      >
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
    </div>
  );
}
