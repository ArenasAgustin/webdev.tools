import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InstallPromptBanner } from "./InstallPromptBanner";

const { installPromptState } = vi.hoisted(() => ({
  installPromptState: {
    canInstall: true,
    install: vi.fn(),
    dismiss: vi.fn(),
  },
}));

vi.mock("@/hooks/useInstallPrompt", () => ({
  useInstallPrompt: () => installPromptState,
}));

describe("InstallPromptBanner", () => {
  beforeEach(() => {
    installPromptState.canInstall = true;
    installPromptState.install.mockReset();
    installPromptState.dismiss.mockReset();
  });

  it("renders nothing when the app cannot be installed", () => {
    installPromptState.canInstall = false;
    const { container } = render(<InstallPromptBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders in normal flow instead of overlaying page content", () => {
    render(<InstallPromptBanner />);
    const banner = screen.getByRole("complementary", { name: "Instalar webdev.tools" });

    // An overlay (fixed/absolute) would intercept clicks on controls underneath.
    expect(banner.className).not.toMatch(/\b(fixed|absolute)\b/);
    // It must keep its height when the app shell is a viewport-height flex column.
    expect(banner).toHaveClass("shrink-0");
  });

  it("calls install and dismiss from its buttons", () => {
    render(<InstallPromptBanner />);

    fireEvent.click(screen.getByRole("button", { name: "Instalar" }));
    fireEvent.click(screen.getByRole("button", { name: "Descartar" }));

    expect(installPromptState.install).toHaveBeenCalledTimes(1);
    expect(installPromptState.dismiss).toHaveBeenCalledTimes(1);
  });
});
