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
});
