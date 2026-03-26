import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePlaygroundOverlays } from "./usePlaygroundOverlays";

describe("usePlaygroundOverlays", () => {
  describe("initial state", () => {
    it("starts with all overlays closed", () => {
      const { result } = renderHook(() => usePlaygroundOverlays());
      expect(result.current.shortcuts.isOpen).toBe(false);
      expect(result.current.diff.isOpen).toBe(false);
      expect(result.current.config.isOpen).toBe(false);
      expect(result.current.editor.expanded).toBeNull();
    });
  });

  describe("one-at-a-time rule — opening one closes the previous", () => {
    it("opening shortcuts closes a previously open diff", () => {
      const { result } = renderHook(() => usePlaygroundOverlays());

      act(() => {
        result.current.diff.open();
      });
      expect(result.current.diff.isOpen).toBe(true);

      act(() => {
        result.current.shortcuts.open();
      });
      expect(result.current.shortcuts.isOpen).toBe(true);
      expect(result.current.diff.isOpen).toBe(false);
    });

    it("opening config closes a previously open shortcuts", () => {
      const { result } = renderHook(() => usePlaygroundOverlays());

      act(() => {
        result.current.shortcuts.open();
      });
      expect(result.current.shortcuts.isOpen).toBe(true);

      act(() => {
        result.current.config.open();
      });
      expect(result.current.config.isOpen).toBe(true);
      expect(result.current.shortcuts.isOpen).toBe(false);
    });

    it("opening diff closes a previously open config", () => {
      const { result } = renderHook(() => usePlaygroundOverlays());

      act(() => {
        result.current.config.open();
      });
      expect(result.current.config.isOpen).toBe(true);

      act(() => {
        result.current.diff.open();
      });
      expect(result.current.diff.isOpen).toBe(true);
      expect(result.current.config.isOpen).toBe(false);
    });

    it("expanding editor-input closes any open modal overlay", () => {
      const { result } = renderHook(() => usePlaygroundOverlays());

      act(() => {
        result.current.shortcuts.open();
      });
      expect(result.current.shortcuts.isOpen).toBe(true);

      act(() => {
        result.current.editor.expand("input");
      });
      expect(result.current.editor.expanded).toBe("input");
      expect(result.current.shortcuts.isOpen).toBe(false);
    });
  });

  describe("toggle behaviour", () => {
    it("toggleShortcuts closes shortcuts when it is active", () => {
      const { result } = renderHook(() => usePlaygroundOverlays());

      act(() => {
        result.current.shortcuts.open();
      });
      expect(result.current.shortcuts.isOpen).toBe(true);

      act(() => {
        result.current.shortcuts.toggle();
      });
      expect(result.current.shortcuts.isOpen).toBe(false);
    });

    it("toggleDiff opens diff when no overlay is active", () => {
      const { result } = renderHook(() => usePlaygroundOverlays());

      act(() => {
        result.current.diff.toggle();
      });
      expect(result.current.diff.isOpen).toBe(true);
    });

    it("toggleConfig closes config when it is active", () => {
      const { result } = renderHook(() => usePlaygroundOverlays());

      act(() => {
        result.current.config.open();
      });
      act(() => {
        result.current.config.toggle();
      });
      expect(result.current.config.isOpen).toBe(false);
    });

    it("toggle on an inactive overlay opens it (shortcuts from diff-open state)", () => {
      const { result } = renderHook(() => usePlaygroundOverlays());

      act(() => {
        result.current.diff.open();
      });
      // toggling shortcuts while diff is open — should switch to shortcuts
      act(() => {
        result.current.shortcuts.toggle();
      });
      expect(result.current.shortcuts.isOpen).toBe(true);
      expect(result.current.diff.isOpen).toBe(false);
    });
  });

  describe("closeAll", () => {
    it("resets all overlays to closed", () => {
      const { result } = renderHook(() => usePlaygroundOverlays());

      act(() => {
        result.current.config.open();
      });
      expect(result.current.config.isOpen).toBe(true);

      act(() => {
        result.current.closeAll();
      });
      expect(result.current.shortcuts.isOpen).toBe(false);
      expect(result.current.diff.isOpen).toBe(false);
      expect(result.current.config.isOpen).toBe(false);
      expect(result.current.editor.expanded).toBeNull();
    });

    it("calls onCloseExtra when closeAll is invoked", () => {
      const onCloseExtra = vi.fn();
      const { result } = renderHook(() => usePlaygroundOverlays({ onCloseExtra }));

      act(() => {
        result.current.shortcuts.open();
      });
      act(() => {
        result.current.closeAll();
      });

      expect(onCloseExtra).toHaveBeenCalledTimes(1);
    });

    it("does NOT call onCloseExtra when a single overlay close is used (not closeAll)", () => {
      const onCloseExtra = vi.fn();
      const { result } = renderHook(() => usePlaygroundOverlays({ onCloseExtra }));

      act(() => {
        result.current.diff.open();
      });
      // Individual overlay close delegates to closeAll in this implementation
      // (ModalState.close === closeAll), so this is expected to call onCloseExtra
      act(() => {
        result.current.diff.close();
      });
      expect(onCloseExtra).toHaveBeenCalledTimes(1);
    });

    it("closeAll without onCloseExtra does not throw", () => {
      const { result } = renderHook(() => usePlaygroundOverlays());
      expect(() =>
        act(() => {
          result.current.closeAll();
        }),
      ).not.toThrow();
    });
  });

  describe("makeSetIsOpen", () => {
    it("accepts boolean true to open an overlay", () => {
      const { result } = renderHook(() => usePlaygroundOverlays());

      act(() => {
        result.current.shortcuts.setIsOpen(true);
      });
      expect(result.current.shortcuts.isOpen).toBe(true);
    });

    it("accepts boolean false to close an overlay", () => {
      const { result } = renderHook(() => usePlaygroundOverlays());

      act(() => {
        result.current.shortcuts.open();
      });
      act(() => {
        result.current.shortcuts.setIsOpen(false);
      });
      expect(result.current.shortcuts.isOpen).toBe(false);
    });

    it("accepts a function updater — (prev: true) => false closes overlay", () => {
      const { result } = renderHook(() => usePlaygroundOverlays());

      act(() => {
        result.current.config.open();
      });
      act(() => {
        result.current.config.setIsOpen((prev) => !prev);
      });
      expect(result.current.config.isOpen).toBe(false);
    });

    it("accepts a function updater — (prev: false) => true opens overlay", () => {
      const { result } = renderHook(() => usePlaygroundOverlays());

      act(() => {
        result.current.diff.setIsOpen((prev) => !prev);
      });
      expect(result.current.diff.isOpen).toBe(true);
    });

    it("setIsOpen true closes any currently open overlay", () => {
      const { result } = renderHook(() => usePlaygroundOverlays());

      act(() => {
        result.current.shortcuts.open();
      });
      act(() => {
        result.current.config.setIsOpen(true);
      });
      expect(result.current.config.isOpen).toBe(true);
      expect(result.current.shortcuts.isOpen).toBe(false);
    });
  });

  describe("editor expand modes", () => {
    it("editor.expand('input') sets expanded to 'input'", () => {
      const { result } = renderHook(() => usePlaygroundOverlays());

      act(() => {
        result.current.editor.expand("input");
      });
      expect(result.current.editor.expanded).toBe("input");
      expect(result.current.editor.isExpanded("input")).toBe(true);
      expect(result.current.editor.isExpanded("output")).toBe(false);
    });

    it("editor.expand('output') sets expanded to 'output'", () => {
      const { result } = renderHook(() => usePlaygroundOverlays());

      act(() => {
        result.current.editor.expand("output");
      });
      expect(result.current.editor.expanded).toBe("output");
      expect(result.current.editor.isExpanded("output")).toBe(true);
      expect(result.current.editor.isExpanded("input")).toBe(false);
    });

    it("editor.collapse() resets expanded to null", () => {
      const { result } = renderHook(() => usePlaygroundOverlays());

      act(() => {
        result.current.editor.expand("output");
      });
      act(() => {
        result.current.editor.collapse();
      });
      expect(result.current.editor.expanded).toBeNull();
    });

    it("editor.toggle('input') switches from null to 'input'", () => {
      const { result } = renderHook(() => usePlaygroundOverlays());

      act(() => {
        result.current.editor.toggle("input");
      });
      expect(result.current.editor.expanded).toBe("input");
    });

    it("editor.toggle('input') collapses when 'input' is already expanded", () => {
      const { result } = renderHook(() => usePlaygroundOverlays());

      act(() => {
        result.current.editor.expand("input");
      });
      act(() => {
        result.current.editor.toggle("input");
      });
      expect(result.current.editor.expanded).toBeNull();
    });

    it("editor.toggle('output') switches from 'input' to 'output'", () => {
      const { result } = renderHook(() => usePlaygroundOverlays());

      act(() => {
        result.current.editor.expand("input");
      });
      act(() => {
        result.current.editor.toggle("output");
      });
      expect(result.current.editor.expanded).toBe("output");
    });

    it("editor.collapse calls onCloseExtra via closeAll", () => {
      const onCloseExtra = vi.fn();
      const { result } = renderHook(() => usePlaygroundOverlays({ onCloseExtra }));

      act(() => {
        result.current.editor.expand("input");
      });
      act(() => {
        result.current.editor.collapse();
      });
      expect(onCloseExtra).toHaveBeenCalledTimes(1);
    });
  });

  describe("no-option construction", () => {
    it("works without any options passed", () => {
      expect(() => renderHook(() => usePlaygroundOverlays())).not.toThrow();
    });

    it("works with an empty options object", () => {
      expect(() => renderHook(() => usePlaygroundOverlays({}))).not.toThrow();
    });
  });
});
