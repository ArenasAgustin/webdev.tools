import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { UpdatePromptBanner } from "./UpdatePromptBanner";
import { SW_UPDATE_EVENT } from "@/hooks/useServiceWorkerUpdate";

describe("UpdatePromptBanner", () => {
  const originalLocation = window.location;

  afterEach(() => {
    delete (window as { __swUpdateReady?: boolean }).__swUpdateReady;
    Object.defineProperty(window, "location", { value: originalLocation, configurable: true });
  });

  it("renders nothing until a new version takes over", () => {
    const { container } = render(<UpdatePromptBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it("offers a reload when the update event fires, and reloads only on click", () => {
    const reload = vi.fn();
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, reload },
      configurable: true,
    });
    render(<UpdatePromptBanner />);

    act(() => {
      window.dispatchEvent(new Event(SW_UPDATE_EVENT));
    });

    expect(screen.getByRole("status")).toHaveTextContent("Hay una nueva versión disponible");
    expect(reload).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Recargar" }));
    expect(reload).toHaveBeenCalledOnce();
  });

  it("shows the notice when the update happened before the app mounted", () => {
    (window as { __swUpdateReady?: boolean }).__swUpdateReady = true;
    render(<UpdatePromptBanner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("can be dismissed without reloading", () => {
    (window as { __swUpdateReady?: boolean }).__swUpdateReady = true;
    render(<UpdatePromptBanner />);
    fireEvent.click(screen.getByRole("button", { name: "Descartar" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
