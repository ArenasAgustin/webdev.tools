import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOnlineStatus } from "../useOnlineStatus";

beforeEach(() => {
  // Mockear window en entorno SSR
  const eventListeners: Record<string, EventListener[]> = {};
  
  // Crear un objeto que simule window
  const mockWindow = {
    navigator: {
      onLine: true,
    },
    addEventListener: (type: string, listener: EventListener) => {
      if (!eventListeners[type]) {
        eventListeners[type] = [];
      }
      eventListeners[type].push(listener);
    },
    removeEventListener: (type: string, listener: EventListener) => {
      if (eventListeners[type]) {
        eventListeners[type] = eventListeners[type].filter(l => l !== listener);
      }
    },
    dispatchEvent: (event: Event) => {
      const listeners = eventListeners[event.type] || [];
      listeners.forEach(listener => listener(event));
      return true;
    },
  };
  
  // Mockear window usando vi.stubGlobal
  vi.stubGlobal('window', mockWindow);
  
  // Mockear navigator.onLine con vi.spyOn
  vi.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useOnlineStatus", () => {
  beforeEach(() => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns true when initially online", () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it("returns false when initially offline", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
  });

  it("updates to false when offline event fires", () => {
    const { result } = renderHook(() => useOnlineStatus());
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current).toBe(false);
  });

  it("updates to true when online event fires after going offline", () => {
    vi.spyOn(globalThis.navigator, "onLine", "get").mockReturnValue(false);
    const { result } = renderHook(() => useOnlineStatus());
    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    expect(result.current).toBe(true);
  });
});
