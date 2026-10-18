import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ShortcutsModal } from "./ShortcutsModal";

describe("ShortcutsModal", () => {
  it("documents the editor Tab focus toggle shortcut", () => {
    render(<ShortcutsModal isOpen onClose={vi.fn()} />);

    expect(screen.getByText("Editor")).toBeInTheDocument();
    const row = screen.getByText(
      "Alternar Tab: indentar / mover el foco fuera del editor",
    ).parentElement!;
    expect(within(row).getByText("Ctrl")).toBeInTheDocument();
    expect(within(row).getByText("M")).toBeInTheDocument();
  });
});
