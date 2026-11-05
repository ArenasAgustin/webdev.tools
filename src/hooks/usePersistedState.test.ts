import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const { getItemMock, setItemMock, removeItemMock } = vi.hoisted(() => ({
  getItemMock: vi.fn(),
  setItemMock: vi.fn(),
  removeItemMock: vi.fn(),
}));

vi.mock("@/services/storage", () => ({
  getItem: getItemMock,
  setItem: setItemMock,
  removeItem: removeItemMock,
}));

import { usePersistedState } from "./usePersistedState";

describe("usePersistedState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns defaultValue when storage is empty", () => {
    getItemMock.mockReturnValue(null);

    const { result } = renderHook(() =>
      usePersistedState("test-key", "default"),
    );

    expect(result.current[0]).toBe("default");
  });

  it("restores persisted value on init", () => {
    getItemMock.mockReturnValue("stored-value");

    const { result } = renderHook(() =>
      usePersistedState("test-key", "default"),
    );

    expect(result.current[0]).toBe("stored-value");
  });

  it("setter updates state", () => {
    getItemMock.mockReturnValue(null);

    const { result } = renderHook(() =>
      usePersistedState("test-key", "initial"),
    );

    act(() => {
      result.current[1]("new-value");
    });

    expect(result.current[0]).toBe("new-value");
  });

  it("setter triggers debounced storage write after 300ms", async () => {
    getItemMock.mockReturnValue(null);

    const { result } = renderHook(() =>
      usePersistedState("test-key", "initial", 300),
    );

    act(() => {
      result.current[1]("updated");
    });

    // Should NOT have written yet
    expect(setItemMock).not.toHaveBeenCalledWith("test-key", "updated");

    // Advance timers past debounce
    await act(async () => {
      vi.advanceTimersByTime(350);
    });

    expect(setItemMock).toHaveBeenCalledWith("test-key", "updated");
  });

  it("supports functional update (setState(prev => next))", () => {
    getItemMock.mockReturnValue(null);

    const { result } = renderHook(() =>
      usePersistedState("test-key", 0),
    );

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it("falls back to defaultValue when storage returns null (corrupt/missing)", () => {
    getItemMock.mockReturnValue(null);

    const { result } = renderHook(() =>
      usePersistedState("test-key", { fallback: true }),
    );

    expect(result.current[0]).toEqual({ fallback: true });
  });

  it("reports when the latest value could not be saved", () => {
    getItemMock.mockReturnValue(null);
    setItemMock.mockReturnValue(true);

    const { result } = renderHook(() => usePersistedState("test-key", "a"));
    expect(result.current[2]).toBe(false);

    setItemMock.mockReturnValue(false);
    act(() => {
      result.current[1]("huge");
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current[2]).toBe(true);

    setItemMock.mockReturnValue(true);
    act(() => {
      result.current[1]("small");
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current[2]).toBe(false);
  });

  it("does not rewrite an unchanged value when the page is hidden, unloaded or unmounted", () => {
    // Another tab may have saved a newer value meanwhile; rewriting this tab's
    // unchanged copy would silently overwrite it.
    getItemMock.mockReturnValue("loaded");
    setItemMock.mockReturnValue(true);
    const { result, unmount } = renderHook(() => usePersistedState("test-key", "a"));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    act(() => {
      result.current[1]("edited");
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(setItemMock).toHaveBeenLastCalledWith("test-key", "edited");
    setItemMock.mockClear();

    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(new Event("pagehide"));
    unmount();

    expect(setItemMock).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it("saves a pending value when the page is hidden or unloaded, before the debounce fires", () => {
    getItemMock.mockReturnValue(null);
    const { result } = renderHook(() => usePersistedState("test-key", "a"));
    setItemMock.mockClear();

    act(() => {
      result.current[1]("typed just before closing");
    });
    window.dispatchEvent(new Event("pagehide"));
    expect(setItemMock).toHaveBeenCalledWith("test-key", "typed just before closing");

    setItemMock.mockClear();
    act(() => {
      result.current[1]("typed before switching tabs");
    });
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(setItemMock).toHaveBeenCalledWith("test-key", "typed before switching tabs");
    vi.restoreAllMocks();
  });
it("does not save a string longer than maxLength, drops its stale copy and flags it", () => {
    getItemMock.mockReturnValue("old");
    setItemMock.mockReturnValue(true);

    const { result } = renderHook(() =>
      usePersistedState("test-key", "default", { maxLength: 5 }),
    );

    act(() => {
      result.current[1]("much too long");
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(setItemMock).not.toHaveBeenCalledWith("test-key", "much too long");
    expect(removeItemMock).toHaveBeenCalledWith("test-key");
    expect(result.current[2]).toBe(true);
  });
});
