import { useInstallPrompt } from "@/hooks/useInstallPrompt";

/**
 * Floating install prompt for PWA installation.
 * Appears when the browser fires beforeinstallprompt.
 */
export function InstallPromptBanner() {
  const { canInstall, install, dismiss } = useInstallPrompt();

  if (!canInstall) return null;

  return (
    <div
      role="complementary"
      aria-label="Instalar aplicación"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl px-4 py-3 animate-fade-in"
    >
      <i className="fas fa-download text-blue-400" aria-hidden="true" />
      <span className="text-sm text-gray-200">Instalar webdev.tools</span>
      <button
        type="button"
        onClick={install}
        className="px-3 py-1 text-xs rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 transition-colors"
      >
        Instalar
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Descartar"
        className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
      >
        <i className="fas fa-times text-xs" aria-hidden="true" />
      </button>
    </div>
  );
}
