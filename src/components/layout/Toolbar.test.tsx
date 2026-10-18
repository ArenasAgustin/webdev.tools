import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Toolbar } from "./Toolbar";
import type { ToolbarConfig } from "@/types/toolbar";

const tools: ToolbarConfig = {
  actions: [
    { id: "format", label: "Format", icon: "indent", variant: "primary", onClick: vi.fn() },
  ],
};

function getToggle() {
  return screen.getByRole("button", { name: /herramientas/i });
}

describe("Toolbar tools toggle", () => {
  it("exposes aria-expanded that flips on click", () => {
    render(<Toolbar variant="generic" tools={tools} />);
    const toggle = getToggle();

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("points aria-controls at the tools panel", () => {
    render(<Toolbar variant="generic" tools={tools} />);
    const toggle = getToggle();
    const panelId = toggle.getAttribute("aria-controls");

    expect(panelId).toBeTruthy();
    const panel = document.getElementById(panelId!);
    expect(panel).not.toBeNull();
    expect(panel).toContainElement(screen.getByRole("button", { name: "Format", hidden: true }));
  });

  it("makes the collapsed panel inert and the expanded panel interactive", () => {
    render(<Toolbar variant="generic" tools={tools} />);
    const toggle = getToggle();
    const panel = document.getElementById(toggle.getAttribute("aria-controls")!)!;

    expect(panel).toHaveAttribute("inert");
    fireEvent.click(toggle);
    expect(panel).not.toHaveAttribute("inert");
  });
});
