import { useEffect, useRef } from "react";

interface KeyboardShortcutsConfig {
  onFormat?: () => void;
  onMinify?: () => void;
  onClean?: () => void;
  onCopyOutput?: () => void;
  onClearInput?: () => void;
  onOpenConfig?: () => void;
  onOpenShortcuts?: () => void;
  onOpenDiff?: () => void;
  onExecute?: () => void;
}

/**
 * Hook to handle keyboard shortcuts for JSON tools
 * Shortcuts:
 * - Ctrl+Shift+F / Cmd+Shift+F: Format
 * - Ctrl+Shift+M / Cmd+Shift+M: Minify
 * - Ctrl+Shift+L / Cmd+Shift+L: Clean
 * - Ctrl+Shift+C / Cmd+Shift+C: Copy output
 * - Ctrl+Shift+Delete / Cmd+Shift+Delete: Clear input
 * - Ctrl+Shift+Enter / Cmd+Shift+Enter: Execute (only when onExecute is provided)
 * - Ctrl+, / Cmd+,: Open config
 */
export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  // Keep a ref so the stable listener always reads the latest callbacks
  // without needing to re-register on every render
  const configRef = useRef(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const config = configRef.current;
      // Don't handle shortcuts if focused on a plain text input or textarea.
      // For contentEditable (e.g. Monaco editor), only suppress plain-character
      // shortcuts that conflict with native text editing; keep Ctrl/Cmd+Shift+*
      // shortcuts active so the playground actions remain reachable.
      const target = event.target as HTMLElement;
      const ctrlKey = event.ctrlKey || event.metaKey;
      // Monaco may receive input through a hidden textarea; that is the code
      // editor, not a form field, so it gets the same treatment as contentEditable.
      const inCodeEditor = typeof target.closest === "function" && target.closest(".monaco-editor") !== null;
      if ((target.tagName === "INPUT" || target.tagName === "TEXTAREA") && !inCodeEditor) {
        return;
      }
      if (target.contentEditable !== "false" && !ctrlKey) {
        return;
      }
      const normalizedKey = event.key.length === 1 ? event.key.toUpperCase() : event.key;

      // Run a playground action and keep the editor from also handling the key
      // (e.g. Monaco binds Ctrl+Shift+L to "select all occurrences").
      const run = (handler: (() => void) | undefined) => {
        if (!handler) return;
        event.stopPropagation();
        handler();
      };

      // Ctrl/Cmd+Shift+F: Format
      if (ctrlKey && event.shiftKey && normalizedKey === "F") {
        event.preventDefault();
        run(config.onFormat);
      }

      // Ctrl/Cmd+Shift+M: Minify
      if (ctrlKey && event.shiftKey && normalizedKey === "M") {
        event.preventDefault();
        run(config.onMinify);
      }

      // Ctrl/Cmd+Shift+L: Clean
      if (ctrlKey && event.shiftKey && normalizedKey === "L") {
        event.preventDefault();
        run(config.onClean);
      }

      // Ctrl/Cmd+Shift+C: Copy output
      if (ctrlKey && event.shiftKey && normalizedKey === "C") {
        event.preventDefault();
        run(config.onCopyOutput);
      }

      // Ctrl/Cmd+Shift+Delete: Clear input
      if (ctrlKey && event.shiftKey && normalizedKey === "Delete") {
        event.preventDefault();
        run(config.onClearInput);
      }

      // Ctrl/Cmd+Shift+Enter: Execute. Only preventDefault when a handler exists so
      // playgrounds without execute don't swallow the Enter key.
      // Uses Shift to avoid Monaco's built-in Ctrl+Enter ("Insert Line Below").
      if (ctrlKey && event.shiftKey && event.key === "Enter" && config.onExecute) {
        event.preventDefault();
        run(config.onExecute);
      }

      // Ctrl/Cmd+,: Open config
      if (ctrlKey && event.key === ",") {
        event.preventDefault();
        run(config.onOpenConfig);
      }

      // Ctrl/Cmd+': Open shortcuts modal
      if (ctrlKey && !event.shiftKey && event.key === "'") {
        event.preventDefault();
        run(config.onOpenShortcuts);
      }

      // Ctrl/Cmd+Shift+D: Open diff viewer
      if (ctrlKey && event.shiftKey && normalizedKey === "D") {
        event.preventDefault();
        run(config.onOpenDiff);
      }
    };

    // Capture phase: Monaco handles its own keybindings on the editor node and
    // stops propagation, so a bubbling listener never sees e.g. Ctrl+Shift+L.
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, []);
}
