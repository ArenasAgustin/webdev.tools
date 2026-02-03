import { useState, useCallback } from "react";

type EditorType = "input" | "output";

interface UseExpandedEditorReturn {
  expanded: EditorType | null;
  isExpanded: (type: EditorType) => boolean;
  expand: (type: EditorType) => void;
  collapse: () => void;
  toggle: (type: EditorType) => void;
}

/**
 * Hook to manage expanded editor modal state
 * Handles opening/closing and switching between input and output expanded views
 */
export function useExpandedEditor(): UseExpandedEditorReturn {
  const [expanded, setExpanded] = useState<EditorType | null>(null);

  const isExpanded = useCallback(
    (type: EditorType) => expanded === type,
    [expanded],
  );

  const expand = useCallback((type: EditorType) => {
    setExpanded(type);
  }, []);

  const collapse = useCallback(() => {
    setExpanded(null);
  }, []);

  const toggle = useCallback((type: EditorType) => {
    setExpanded((current) => (current === type ? null : type));
  }, []);

  return {
    expanded,
    isExpanded,
    expand,
    collapse,
    toggle,
  };
}
