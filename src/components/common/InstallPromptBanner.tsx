import { useTranslation } from "react-i18next";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

/**
 * Install prompt for PWA installation.
 * Appears when the browser fires beforeinstallprompt.
 * Rendered in normal flow at the bottom of the app shell (not as an overlay),
 * so the page above shrinks to fit and no interactive content is covered.
 */
export function InstallPromptBanner() {
  const { t } = useTranslation();
  const { canInstall, install, dismiss } = useInstallPrompt();

  if (!canInstall) return null;

  return (
    <div
      role="complementary"
      aria-label={t("install.title")}
      className="shrink-0 flex justify-center bg-slate-950 px-2 py-2 sm:px-4"
    >
      <div className="flex max-w-full items-center gap-3 bg-white/10 border border-white/5 rounded-2xl px-4 py-2 animate-fade-in">
        <i className="fas fa-download text-blue-400" aria-hidden="true" />
        <span className="text-sm text-white/90">{t("install.title")}</span>
        <button
          type="button"
          onClick={install}
          className="px-3 py-1 text-xs rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 transition-colors"
        >
          {t("install.action")}
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("install.dismiss")}
          className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <i className="fas fa-times text-xs" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
