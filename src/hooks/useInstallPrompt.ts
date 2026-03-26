import { useCallback, useEffect, useState } from "react";
import { getItem, setItem, STORAGE_KEYS } from "@/services/storage";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface UseInstallPromptReturn {
  canInstall: boolean;
  install: () => Promise<void>;
  dismiss: () => void;
}

/**
 * Manages the PWA install prompt.
 * Captures the beforeinstallprompt event and exposes install/dismiss controls.
 */
export function useInstallPrompt(): UseInstallPromptReturn {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      if (getItem<boolean>(STORAGE_KEYS.PWA_INSTALL_DISMISSED)) return;
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    const handler = () => setPromptEvent(null);
    window.addEventListener("appinstalled", handler);
    return () => window.removeEventListener("appinstalled", handler);
  }, []);

  const install = useCallback(async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") setPromptEvent(null);
  }, [promptEvent]);

  const dismiss = useCallback(() => {
    setItem(STORAGE_KEYS.PWA_INSTALL_DISMISSED, true);
    setPromptEvent(null);
  }, []);

  return { canInstall: promptEvent !== null, install, dismiss };
}
