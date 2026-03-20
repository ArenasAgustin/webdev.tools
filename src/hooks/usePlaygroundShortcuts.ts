import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface PlaygroundShortcutsHandlers {
  onFormat: () => void;
  onMinify: () => void;
  onClean?: () => void;
  onCopyOutput: () => void;
  onClearInput: () => void;
  onOpenConfig: () => void;
  onOpenShortcuts?: () => void;
}

export function usePlaygroundShortcuts(handlers: PlaygroundShortcutsHandlers) {
  useKeyboardShortcuts({
    onFormat: handlers.onFormat,
    onMinify: handlers.onMinify,
    onClean: handlers.onClean,
    onCopyOutput: handlers.onCopyOutput,
    onClearInput: handlers.onClearInput,
    onOpenConfig: handlers.onOpenConfig,
    onOpenShortcuts: handlers.onOpenShortcuts,
  });
}
