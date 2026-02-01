import { useEffect } from "react";

interface KeyboardShortcutsConfig {
  onFormat?: () => void;
  onMinify?: () => void;
  onClean?: () => void;
  onCopyOutput?: () => void;
  onClearInput?: () => void;
  onOpenConfig?: () => void;
}

/**
 * Hook to handle keyboard shortcuts for JSON tools
 * Shortcuts:
 * - Ctrl+Shift+F / Cmd+Shift+F: Format
 * - Ctrl+Shift+M / Cmd+Shift+M: Minify
 * - Ctrl+Shift+L / Cmd+Shift+L: Clean
 * - Ctrl+Shift+C / Cmd+Shift+C: Copy output
 * - Ctrl+Shift+Delete / Cmd+Shift+Delete: Clear input
 * - Ctrl+, / Cmd+,: Open config
 */
export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle shortcuts if focused on input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true"
      ) {
        return;
      }

      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
      const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

      // Ctrl/Cmd+Shift+F: Format
      if (ctrlKey && event.shiftKey && event.key === "F") {
        event.preventDefault();
        config.onFormat?.();
      }

      // Ctrl/Cmd+Shift+M: Minify
      if (ctrlKey && event.shiftKey && event.key === "M") {
        event.preventDefault();
        config.onMinify?.();
      }

      // Ctrl/Cmd+Shift+L: Clean
      if (ctrlKey && event.shiftKey && event.key === "L") {
        event.preventDefault();
        config.onClean?.();
      }

      // Ctrl/Cmd+Shift+C: Copy output
      if (ctrlKey && event.shiftKey && event.key === "C") {
        event.preventDefault();
        config.onCopyOutput?.();
      }

      // Ctrl/Cmd+Shift+Delete: Clear input
      if (ctrlKey && event.shiftKey && event.key === "Delete") {
        event.preventDefault();
        config.onClearInput?.();
      }

      // Ctrl/Cmd+,: Open config
      if (ctrlKey && event.key === ",") {
        event.preventDefault();
        config.onOpenConfig?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [config]);
}
