import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";

describe("useKeyboardShortcuts", () => {
  let onFormat: ReturnType<typeof vi.fn<() => void>>;
  let onMinify: ReturnType<typeof vi.fn<() => void>>;
  let onClean: ReturnType<typeof vi.fn<() => void>>;
  let onCopyOutput: ReturnType<typeof vi.fn<() => void>>;
  let onClearInput: ReturnType<typeof vi.fn<() => void>>;
  let onOpenConfig: ReturnType<typeof vi.fn<() => void>>;
  let onOpenShortcuts: ReturnType<typeof vi.fn<() => void>>;
  let onOpenDiff: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(() => {
    onFormat = vi.fn<() => void>();
    onMinify = vi.fn<() => void>();
    onClean = vi.fn<() => void>();
    onCopyOutput = vi.fn<() => void>();
    onClearInput = vi.fn<() => void>();
    onOpenConfig = vi.fn<() => void>();
    onOpenShortcuts = vi.fn<() => void>();
    onOpenDiff = vi.fn<() => void>();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderShortcuts = (overrides = {}) =>
    renderHook(() =>
      useKeyboardShortcuts({
        onFormat,
        onMinify,
        onClean,
        onCopyOutput,
        onClearInput,
        onOpenConfig,
        onOpenShortcuts,
        onOpenDiff,
        ...overrides,
      }),
    );

  describe("shortcut dispatching", () => {
    it("Ctrl+Shift+F triggers onFormat", () => {
      renderShortcuts();
      fireEvent.keyDown(window, { key: "F", ctrlKey: true, shiftKey: true });
      expect(onFormat).toHaveBeenCalledTimes(1);
    });

    it("Ctrl+Shift+M triggers onMinify", () => {
      renderShortcuts();
      fireEvent.keyDown(window, { key: "M", ctrlKey: true, shiftKey: true });
      expect(onMinify).toHaveBeenCalledTimes(1);
    });

    it("Ctrl+Shift+L triggers onClean", () => {
      renderShortcuts();
      fireEvent.keyDown(window, { key: "L", ctrlKey: true, shiftKey: true });
      expect(onClean).toHaveBeenCalledTimes(1);
    });

    it("Ctrl+Shift+C triggers onCopyOutput", () => {
      renderShortcuts();
      fireEvent.keyDown(window, { key: "C", ctrlKey: true, shiftKey: true });
      expect(onCopyOutput).toHaveBeenCalledTimes(1);
    });

    it("Ctrl+Shift+Delete triggers onClearInput", () => {
      renderShortcuts();
      fireEvent.keyDown(window, { key: "Delete", ctrlKey: true, shiftKey: true });
      expect(onClearInput).toHaveBeenCalledTimes(1);
    });

    it("Ctrl+, triggers onOpenConfig", () => {
      renderShortcuts();
      fireEvent.keyDown(window, { key: ",", ctrlKey: true });
      expect(onOpenConfig).toHaveBeenCalledTimes(1);
    });

    it("Ctrl+' triggers onOpenShortcuts", () => {
      renderShortcuts();
      fireEvent.keyDown(window, { key: "'", ctrlKey: true });
      expect(onOpenShortcuts).toHaveBeenCalledTimes(1);
    });

    it("Ctrl+Shift+D triggers onOpenDiff", () => {
      renderShortcuts();
      fireEvent.keyDown(window, { key: "D", ctrlKey: true, shiftKey: true });
      expect(onOpenDiff).toHaveBeenCalledTimes(1);
    });

    it("Cmd+Shift+F (metaKey) also triggers onFormat", () => {
      renderShortcuts();
      fireEvent.keyDown(window, { key: "F", metaKey: true, shiftKey: true });
      expect(onFormat).toHaveBeenCalledTimes(1);
    });

    it("lowercase key is normalised — Ctrl+Shift+f triggers onFormat", () => {
      renderShortcuts();
      fireEvent.keyDown(window, { key: "f", ctrlKey: true, shiftKey: true });
      expect(onFormat).toHaveBeenCalledTimes(1);
    });
  });

  describe("focus guard — no dispatch when typing in form elements", () => {
    it("does not trigger when target is INPUT", () => {
      renderShortcuts();
      const input = document.createElement("input");
      document.body.appendChild(input);
      input.focus();
      fireEvent.keyDown(input, { key: "F", ctrlKey: true, shiftKey: true });
      expect(onFormat).not.toHaveBeenCalled();
      document.body.removeChild(input);
    });

    it("does not trigger when target is TEXTAREA", () => {
      renderShortcuts();
      const textarea = document.createElement("textarea");
      document.body.appendChild(textarea);
      textarea.focus();
      fireEvent.keyDown(textarea, { key: "M", ctrlKey: true, shiftKey: true });
      expect(onMinify).not.toHaveBeenCalled();
      document.body.removeChild(textarea);
    });

    it("does not trigger when target has contentEditable=true", () => {
      renderShortcuts();
      const div = document.createElement("div");
      div.contentEditable = "true";
      document.body.appendChild(div);
      div.focus();
      fireEvent.keyDown(div, { key: "L", ctrlKey: true, shiftKey: true });
      expect(onClean).not.toHaveBeenCalled();
      document.body.removeChild(div);
    });
  });

  describe("edge cases", () => {
    it("empty config does not throw", () => {
      expect(() => renderHook(() => useKeyboardShortcuts({}))).not.toThrow();
    });

    it("unrelated key combo does not call any callback", () => {
      renderShortcuts();
      fireEvent.keyDown(window, { key: "Z", ctrlKey: true, shiftKey: true });
      expect(onFormat).not.toHaveBeenCalled();
      expect(onMinify).not.toHaveBeenCalled();
      expect(onClean).not.toHaveBeenCalled();
      expect(onCopyOutput).not.toHaveBeenCalled();
      expect(onClearInput).not.toHaveBeenCalled();
      expect(onOpenConfig).not.toHaveBeenCalled();
      expect(onOpenShortcuts).not.toHaveBeenCalled();
      expect(onOpenDiff).not.toHaveBeenCalled();
    });

    it("removes the listener on unmount", () => {
      const addSpy = vi.spyOn(window, "addEventListener");
      const removeSpy = vi.spyOn(window, "removeEventListener");

      const { unmount } = renderShortcuts();
      expect(addSpy).toHaveBeenCalledWith("keydown", expect.any(Function));

      unmount();
      expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
    });
  });
});
