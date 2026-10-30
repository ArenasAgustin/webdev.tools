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
  let onExecute: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(() => {
    onFormat = vi.fn<() => void>();
    onMinify = vi.fn<() => void>();
    onClean = vi.fn<() => void>();
    onCopyOutput = vi.fn<() => void>();
    onClearInput = vi.fn<() => void>();
    onOpenConfig = vi.fn<() => void>();
    onOpenShortcuts = vi.fn<() => void>();
    onOpenDiff = vi.fn<() => void>();
    onExecute = vi.fn<() => void>();
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
        onExecute,
        ...overrides,
      }),
    );

  describe("shortcut dispatching", () => {
    it("Ctrl+Shift+F triggers onFormat", () => {
      renderShortcuts();
      fireEvent.keyDown(window, { key: "F", ctrlKey: true, shiftKey: true });
      expect(onFormat).toHaveBeenCalledTimes(1);
    });

    it("Alt+Shift+M triggers onMinify, matched by key code (Option+Shift+M types Â on a Mac)", () => {
      renderShortcuts();
      fireEvent.keyDown(window, { key: "M", code: "KeyM", altKey: true, shiftKey: true });
      fireEvent.keyDown(window, { key: "Â", code: "KeyM", altKey: true, shiftKey: true });
      expect(onMinify).toHaveBeenCalledTimes(2);
    });

    it("leaves the browser-reserved Ctrl+Shift+M and Ctrl+Shift+Delete alone", () => {
      renderShortcuts();
      const minify = new KeyboardEvent("keydown", { key: "M", code: "KeyM", ctrlKey: true, shiftKey: true, cancelable: true });
      const clear = new KeyboardEvent("keydown", { key: "Delete", ctrlKey: true, shiftKey: true, cancelable: true });
      window.dispatchEvent(minify);
      window.dispatchEvent(clear);
      expect(onMinify).not.toHaveBeenCalled();
      expect(onClearInput).not.toHaveBeenCalled();
      expect(minify.defaultPrevented).toBe(false);
      expect(clear.defaultPrevented).toBe(false);
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

    it("Ctrl+Shift+Backspace triggers onClearInput", () => {
      renderShortcuts();
      fireEvent.keyDown(window, { key: "Backspace", ctrlKey: true, shiftKey: true });
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

    it("Ctrl+Shift+Enter triggers onExecute", () => {
      renderShortcuts();
      fireEvent.keyDown(window, { key: "Enter", ctrlKey: true, shiftKey: true });
      expect(onExecute).toHaveBeenCalledTimes(1);
    });

    it("Cmd+Shift+Enter (metaKey) also triggers onExecute", () => {
      renderShortcuts();
      fireEvent.keyDown(window, { key: "Enter", metaKey: true, shiftKey: true });
      expect(onExecute).toHaveBeenCalledTimes(1);
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

    it("allows Ctrl+Shift+ shortcuts in contentEditable (e.g. Monaco editor)", () => {
      renderShortcuts();
      const div = document.createElement("div");
      div.contentEditable = "true";
      document.body.appendChild(div);
      div.focus();
      // Ctrl+Shift+L should still trigger because playground actions should be reachable
      fireEvent.keyDown(div, { key: "L", ctrlKey: true, shiftKey: true });
      expect(onClean).toHaveBeenCalled();
      document.body.removeChild(div);
    });

    it("still fires when the editor stops keydown propagation (Monaco's own Ctrl+Shift+L binding)", () => {
      renderShortcuts();
      const editor = document.createElement("div");
      editor.className = "monaco-editor";
      const editContext = document.createElement("div");
      editor.appendChild(editContext);
      document.body.appendChild(editor);
      // Monaco handles its keybindings on the editor node and stops propagation
      editor.addEventListener("keydown", (event) => event.stopPropagation());

      const event = new KeyboardEvent("keydown", {
        key: "L",
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });
      editContext.dispatchEvent(event);

      expect(onClean).toHaveBeenCalledTimes(1);
      expect(event.defaultPrevented).toBe(true);
      document.body.removeChild(editor);
    });

    it("treats a textarea inside a Monaco editor as the editor, not a form field", () => {
      renderShortcuts();
      const editor = document.createElement("div");
      editor.className = "monaco-editor";
      const textarea = document.createElement("textarea");
      editor.appendChild(textarea);
      document.body.appendChild(editor);

      fireEvent.keyDown(textarea, { key: "M", code: "KeyM", altKey: true, shiftKey: true });

      expect(onMinify).toHaveBeenCalledTimes(1);
      document.body.removeChild(editor);
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
      expect(onExecute).not.toHaveBeenCalled();
    });

    it("plain Enter (no Ctrl/Cmd) does not trigger onExecute", () => {
      renderShortcuts();
      fireEvent.keyDown(window, { key: "Enter" });
      expect(onExecute).not.toHaveBeenCalled();
    });

    it("Ctrl+Enter (without Shift) does not trigger onExecute", () => {
      renderShortcuts();
      fireEvent.keyDown(window, { key: "Enter", ctrlKey: true });
      expect(onExecute).not.toHaveBeenCalled();
    });

    it("Ctrl+Shift+Enter without onExecute does not preventDefault nor throw", () => {
      renderHook(() => useKeyboardShortcuts({ onFormat }));
      const event = new KeyboardEvent("keydown", { key: "Enter", ctrlKey: true, shiftKey: true, cancelable: true });
      expect(() => window.dispatchEvent(event)).not.toThrow();
      expect(event.defaultPrevented).toBe(false);
    });

    it("removes the listener on unmount", () => {
      const addSpy = vi.spyOn(window, "addEventListener");
      const removeSpy = vi.spyOn(window, "removeEventListener");

      const { unmount } = renderShortcuts();
      expect(addSpy).toHaveBeenCalledWith("keydown", expect.any(Function), true);

      unmount();
      expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function), true);
    });
  });
});
