import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderWithI18n } from "@/test/test-utils";
import { act, cleanup } from "@testing-library/react";
import { OfflineBanner } from "../OfflineBanner";

describe("OfflineBanner", () => {
  beforeEach(() => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  });

  // Almacenar listeners para limpiarlos en afterEach
  let offlineListeners: ((this: Window, ev: Event) => any)[] = [];
  let onlineListeners: ((this: Window, ev: Event) => any)[] = [];

  beforeEach(() => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    // Sobrescribir addEventListener para capturar listeners
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = vi.fn((event, listener) => {
      if (event === "offline") offlineListeners.push(listener);
      if (event === "online") onlineListeners.push(listener);
      originalAddEventListener.call(window, event, listener);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Limpiar event listeners de window
    offlineListeners.forEach((listener) => window.removeEventListener("offline", listener));
    onlineListeners.forEach((listener) => window.removeEventListener("online", listener));
    offlineListeners = [];
    onlineListeners = [];
    // Limpiar DOM
    cleanup();
  });

  it("renders nothing when online", () => {
    const { container } = renderWithI18n(<OfflineBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("renders offline message when offline", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    const renderResult = renderWithI18n(<OfflineBanner />);
    expect(renderResult.getAllByRole("status")[0]).toBeInTheDocument();
    expect(renderResult.getByText(/sin conexión/i)).toBeInTheDocument();
  });

  it("shows banner when going offline", () => {
    const renderResult = renderWithI18n(<OfflineBanner />);
    expect(renderResult.queryAllByRole("status").length).toBe(0);
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(renderResult.getAllByRole("status")[0]).toBeInTheDocument();
  });

  it("hides banner when coming back online", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    const renderResult = renderWithI18n(<OfflineBanner />);
    expect(renderResult.getAllByRole("status")[0]).toBeInTheDocument();
    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    expect(renderResult.queryAllByRole("status").length).toBe(0);
  });
});
