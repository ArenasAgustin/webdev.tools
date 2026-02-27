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

      const ctrlKey = event.ctrlKey || event.metaKey;
      const normalizedKey = event.key.length === 1 ? event.key.toUpperCase() : event.key;

      // Ctrl/Cmd+Shift+F: Format
      if (ctrlKey && event.shiftKey && normalizedKey === "F") {
        event.preventDefault();
        config.onFormat?.();
      }

      // Ctrl/Cmd+Shift+M: Minify
      if (ctrlKey && event.shiftKey && normalizedKey === "M") {
        event.preventDefault();
        config.onMinify?.();
      }

      // Ctrl/Cmd+Shift+L: Clean
      if (ctrlKey && event.shiftKey && normalizedKey === "L") {
        event.preventDefault();
        config.onClean?.();
      }

      // Ctrl/Cmd+Shift+C: Copy output
      if (ctrlKey && event.shiftKey && normalizedKey === "C") {
        event.preventDefault();
        config.onCopyOutput?.();
      }

      // Ctrl/Cmd+Shift+Delete: Clear input
      if (ctrlKey && event.shiftKey && normalizedKey === "Delete") {
        event.preventDefault();
        config.onClearInput?.();
      }

      // Ctrl/Cmd+,: Open config
      if (ctrlKey && (event.key === "," || event.key === "Comma")) {
        event.preventDefault();
        config.onOpenConfig?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [config]);
}
