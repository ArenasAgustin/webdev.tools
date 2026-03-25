import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/**
 * Shows a banner at the top of the page when the user is offline.
 * Disappears automatically when connectivity is restored.
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500/90 backdrop-blur-sm text-gray-900 text-sm font-medium py-2 px-4 flex items-center justify-center gap-2"
    >
      <i className="fas fa-exclamation-triangle" aria-hidden="true" />
      <span>Sin conexión — las herramientas siguen funcionando localmente</span>
    </div>
  );
}
