import { useTranslation } from "react-i18next";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";

/**
 * Non-blocking "new version available" notice with a Reload button.
 * Rendered in normal flow at the bottom of the app shell, like the install banner,
 * so it never covers page controls. The page reloads only when the user asks.
 */
export function UpdatePromptBanner() {
  const { t } = useTranslation();
  const { updateReady, reload, dismiss } = useServiceWorkerUpdate();

  if (!updateReady) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="shrink-0 flex justify-center bg-slate-950 px-2 py-2 sm:px-4"
    >
      <div className="flex max-w-full items-center gap-3 bg-white/10 border border-white/5 rounded-2xl px-4 py-2 animate-fade-in">
        <i className="fas fa-rotate text-blue-400" aria-hidden="true" />
        <span className="text-sm text-white/90">{t("update.message")}</span>
        <button
          type="button"
          onClick={reload}
          className="px-3 py-1 text-xs rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 transition-colors"
        >
          {t("update.reload")}
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("update.dismiss")}
          className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <i className="fas fa-times text-xs" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
