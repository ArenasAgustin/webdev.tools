import { useState, useCallback, useMemo, type Dispatch, type SetStateAction } from "react";
import type { ModalState } from "@/hooks/useModalState";
import type { UseExpandedEditorReturn } from "@/hooks/useExpandedEditor";

type OverlayKey =
  | "shortcuts"
  | "diff"
  | "config"
  | "editor-input"
  | "editor-output"
  | null;

interface UsePlaygroundOverlaysOptions {
  /** Called when all overlays close — use to close any local modal state */
  onCloseExtra?: () => void;
}

/**
 * Unified overlay manager for playgrounds.
 * - Only one overlay is active at a time; opening one closes all others.
 * - Escape handling is delegated to each overlay component (Modal handles it for
 *   config/shortcuts; ExpandedEditorModal/ExpandedDiffModal handle it themselves).
 */
export function usePlaygroundOverlays(options?: UsePlaygroundOverlaysOptions) {
  const [active, setActive] = useState<OverlayKey>(null);
  const { onCloseExtra } = options ?? {};

  const closeAll = useCallback(() => {
    setActive(null);
    onCloseExtra?.();
  }, [onCloseExtra]);

  // Stable open callbacks
  const openShortcuts = useCallback(() => setActive("shortcuts"), []);
  const openDiff = useCallback(() => setActive("diff"), []);
  const openConfig = useCallback(() => setActive("config"), []);
  const openEditorInput = useCallback(() => setActive("editor-input"), []);
  const openEditorOutput = useCallback(() => setActive("editor-output"), []);

  const toggleShortcuts = useCallback(
    () => setActive((prev) => (prev === "shortcuts" ? null : "shortcuts")),
    [],
  );
  const toggleDiff = useCallback(
    () => setActive((prev) => (prev === "diff" ? null : "diff")),
    [],
  );
  const toggleConfig = useCallback(
    () => setActive((prev) => (prev === "config" ? null : "config")),
    [],
  );

  const makeSetIsOpen = useCallback(
    (key: Exclude<OverlayKey, null>): Dispatch<SetStateAction<boolean>> =>
      (value) => {
        if (typeof value === "function") {
          setActive((prev) => (value(prev === key) ? key : null));
        } else {
          setActive(value ? key : null);
        }
      },
    [],
  );

  const shortcuts: ModalState = useMemo(
    () => ({
      isOpen: active === "shortcuts",
      open: openShortcuts,
      close: closeAll,
      toggle: toggleShortcuts,
      setIsOpen: makeSetIsOpen("shortcuts"),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [active === "shortcuts", openShortcuts, closeAll, toggleShortcuts, makeSetIsOpen],
  );

  const diff: ModalState = useMemo(
    () => ({
      isOpen: active === "diff",
      open: openDiff,
      close: closeAll,
      toggle: toggleDiff,
      setIsOpen: makeSetIsOpen("diff"),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [active === "diff", openDiff, closeAll, toggleDiff, makeSetIsOpen],
  );

  const config: ModalState = useMemo(
    () => ({
      isOpen: active === "config",
      open: openConfig,
      close: closeAll,
      toggle: toggleConfig,
      setIsOpen: makeSetIsOpen("config"),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [active === "config", openConfig, closeAll, toggleConfig, makeSetIsOpen],
  );

  const editor: UseExpandedEditorReturn = useMemo(
    () => ({
      expanded:
        active === "editor-input" ? "input" : active === "editor-output" ? "output" : null,
      isExpanded: (type: "input" | "output") =>
        active === (type === "input" ? "editor-input" : "editor-output"),
      expand: (type: "input" | "output") =>
        type === "input" ? openEditorInput() : openEditorOutput(),
      collapse: closeAll,
      toggle: (type: "input" | "output") => {
        const key: OverlayKey = type === "input" ? "editor-input" : "editor-output";
        setActive((prev) => (prev === key ? null : key));
      },
    }),
     
    [active, openEditorInput, openEditorOutput, closeAll],
  );

  return { shortcuts, diff, config, editor, closeAll };
}
