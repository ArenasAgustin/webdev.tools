import { useCallback, useEffect, useState } from "react";

/**
 * Event the inline bootstrap script in index.html dispatches when a new service
 * worker replaces the one that controlled the page (a new deploy). It also sets
 * `window.__swUpdateReady`, in case that happens before React mounts.
 */
export const SW_UPDATE_EVENT = "sw-update-ready";

interface UpdateFlagWindow {
  __swUpdateReady?: boolean;
}

interface UseServiceWorkerUpdateReturn {
  updateReady: boolean;
  reload: () => void;
  dismiss: () => void;
}

/**
 * Tells the app a new version is available. The page is never reloaded on its
 * own (that would lose unsaved input, the SQL database, run output…): the user
 * reloads when ready.
 */
export function useServiceWorkerUpdate(): UseServiceWorkerUpdateReturn {
  const [updateReady, setUpdateReady] = useState(
    () => (window as UpdateFlagWindow).__swUpdateReady === true,
  );

  useEffect(() => {
    const onUpdate = () => setUpdateReady(true);
    window.addEventListener(SW_UPDATE_EVENT, onUpdate);
    return () => window.removeEventListener(SW_UPDATE_EVENT, onUpdate);
  }, []);

  const reload = useCallback(() => window.location.reload(), []);
  const dismiss = useCallback(() => setUpdateReady(false), []);

  return { updateReady, reload, dismiss };
}
