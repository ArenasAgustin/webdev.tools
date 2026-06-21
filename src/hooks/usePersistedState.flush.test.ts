import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const { getItemMock, setItemMock } = vi.hoisted(() => ({
  getItemMock: vi.fn(),
  setItemMock: vi.fn(),
}));

vi.mock("@/services/storage", () => ({
  getItem: getItemMock,
  setItem: setItemMock,
}));

import { usePersistedState } from "./usePersistedState";

describe("usePersistedState — flush on unmount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("writes latest value synchronously on unmount BEFORE debounce fires", async () => {
    getItemMock.mockReturnValue(null);

    const { result, unmount } = renderHook(() =>
      usePersistedState("flush-key", "initial", 300),
    );

    // Change the value
    act(() => {
      result.current[1]("updated-before-debounce");
    });

    // Debounce has NOT fired yet (only 50ms elapsed)
    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    // The debounced write should not have happened yet
    expect(setItemMock).not.toHaveBeenCalledWith("flush-key", "updated-before-debounce");

    // Unmount BEFORE the 300ms debounce
    unmount();

    // The flush-on-unmount effect should have called setItem with the latest value
    expect(setItemMock).toHaveBeenCalledWith("flush-key", "updated-before-debounce");
  });

  it("flush on unmount writes the LATEST value (not the stale debounced one)", async () => {
    getItemMock.mockReturnValue(null);

    const { result, unmount } = renderHook(() =>
      usePersistedState("flush-key-latest", "initial", 300),
    );

    // Change value multiple times rapidly
    act(() => {
      result.current[1]("first");
    });
    act(() => {
      result.current[1]("second");
    });
    act(() => {
      result.current[1]("third-final");
    });

    // Advance only 100ms — still within debounce window
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // Unmount before debounce fires
    unmount();

    // Must flush with the LATEST value "third-final"
    const calls = setItemMock.mock.calls.filter(([k]) => k === "flush-key-latest");
    const lastCall = calls[calls.length - 1];
    expect(lastCall).toEqual(["flush-key-latest", "third-final"]);
  });

  it("cleanup effect keys on [key] — does NOT re-run on every value change", async () => {
    getItemMock.mockReturnValue(null);

    // Track how many times setItem is called DURING value changes (before debounce)
    setItemMock.mockClear();

    const { result } = renderHook(() =>
      usePersistedState("stable-key", "a", 300),
    );

    // Multiple value changes — setItem should NOT be called in between
    act(() => { result.current[1]("b"); });
    act(() => { result.current[1]("c"); });
    act(() => { result.current[1]("d"); });

    // Only 50ms passed — debounce still pending
    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    // setItem should NOT have been called with any intermediate value
    expect(setItemMock).not.toHaveBeenCalledWith("stable-key", "b");
    expect(setItemMock).not.toHaveBeenCalledWith("stable-key", "c");
    // "d" has not been written yet either
    expect(setItemMock).not.toHaveBeenCalledWith("stable-key", "d");
  });

  it("normal debounced write is unaffected when component stays mounted", async () => {
    getItemMock.mockReturnValue(null);

    const { result } = renderHook(() =>
      usePersistedState("debounce-key", "start", 300),
    );

    act(() => {
      result.current[1]("typed");
    });

    // Not called before debounce
    expect(setItemMock).not.toHaveBeenCalledWith("debounce-key", "typed");

    // Advance past debounce
    await act(async () => {
      vi.advanceTimersByTime(350);
    });

    // Now the debounced write fires
    expect(setItemMock).toHaveBeenCalledWith("debounce-key", "typed");
  });
});
