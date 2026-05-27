import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderWithI18n } from "@/test/test-utils";
import { screen, act } from "@testing-library/react";
import { OfflineBanner } from "../OfflineBanner";

describe("OfflineBanner", () => {
  beforeEach(() => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing when online", () => {
    const { container } = renderWithI18n(<OfflineBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("renders offline message when offline", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    const renderResult = renderWithI18n(<OfflineBanner />);
    expect(renderResult.getByRole("status")).toBeInTheDocument();
    expect(renderResult.getByText(/sin conexión/i)).toBeInTheDocument();
  });

  it("shows banner when going offline", () => {
    const renderResult = renderWithI18n(<OfflineBanner />);
    expect(renderResult.queryByRole("status")).toBeNull();
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(renderResult.getByRole("status")).toBeInTheDocument();
  });

  it("hides banner when coming back online", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    const renderResult = renderWithI18n(<OfflineBanner />);
    expect(renderResult.getByRole("status")).toBeInTheDocument();
    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    expect(renderResult.queryByRole("status")).toBeNull();
  });
});
