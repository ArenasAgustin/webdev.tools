import { useTranslation } from "react-i18next";

/**
 * Shown in place of an editor when Monaco could not be loaded (offline before it was
 * cached, CDN blocked). The loader keeps a failed load for the page's lifetime, so
 * Retry reloads the page; persisted inputs survive the reload.
 */
export function EditorLoadError() {
  const { t } = useTranslation();
  return (
    <div
      role="alert"
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 p-4 text-center text-xs text-white"
    >
      <span>{t("editor.loadError")}</span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-md bg-white/10 px-3 py-1 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
      >
        {t("editor.retry")}
      </button>
    </div>
  );
}
