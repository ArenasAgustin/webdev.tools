import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { EditorTabBar } from "@/components/editor/EditorTabBar";
import { PlaygroundSidebar } from "@/components/layout/PlaygroundSidebar";
import { ColorsPlayground } from "@/playgrounds/colors/ColorsPlayground";

vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() }),
}));

// Tests run in Spanish: any English accessible name here is hardcoded copy.
describe("accessible names follow the UI language", () => {
  it("editor tab bar", () => {
    render(<EditorTabBar activeTab="input" onTabChange={vi.fn()} />);
    expect(screen.getByRole("tablist", { name: "Paneles del editor" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Entrada" })).toBeInTheDocument();
  });

  it("sidebar GitHub link", () => {
    render(
      <MemoryRouter>
        <PlaygroundSidebar currentPlaygroundId="json" isOpen onClose={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Repositorio en GitHub" })).toBeInTheDocument();
  });

  it("color picker sliders", () => {
    render(<ColorsPlayground />);
    expect(screen.getByRole("slider", { name: "Saturación y brillo" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Tono" })).toBeInTheDocument();
  });
});
