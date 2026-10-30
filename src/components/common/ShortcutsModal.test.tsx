import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, within, act } from "@testing-library/react";
import i18n from "i18next";
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

  describe("Delete key label", () => {
    afterEach(async () => {
      await act(() => i18n.changeLanguage("es"));
    });

    it.each([
      ["es", "Supr"],
      ["en", "Delete"],
    ])("uses the %s keyboard name for the clear-input shortcut", async (lng, key) => {
      await act(() => i18n.changeLanguage(lng));
      render(<ShortcutsModal isOpen onClose={vi.fn()} />);

      const description = i18n.t("shortcuts.clearInput");
      const row = screen.getByText(description).parentElement!;
      expect(within(row).getByText(key)).toBeInTheDocument();
    });
  });
});
