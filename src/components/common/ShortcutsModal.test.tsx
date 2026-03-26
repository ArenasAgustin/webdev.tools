import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ShortcutsModal } from "./ShortcutsModal";

describe("ShortcutsModal", () => {
  it("hides modal content when isOpen is false", () => {
    render(<ShortcutsModal isOpen={false} onClose={vi.fn()} />);

    expect(screen.queryByText("Atajos de teclado")).not.toBeInTheDocument();
  });

  it("shows modal content when isOpen is true", () => {
    render(<ShortcutsModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText("Atajos de teclado")).toBeInTheDocument();
  });

  it("does not render 'Limpiar vacíos' row when hasClean is not provided", () => {
    render(<ShortcutsModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.queryByText("Limpiar vacíos")).not.toBeInTheDocument();
  });

  it("does not render 'Limpiar vacíos' row when hasClean is false", () => {
    render(<ShortcutsModal isOpen={true} onClose={vi.fn()} hasClean={false} />);

    expect(screen.queryByText("Limpiar vacíos")).not.toBeInTheDocument();
  });

  it("renders 'Limpiar vacíos' row when hasClean is true", () => {
    render(<ShortcutsModal isOpen={true} onClose={vi.fn()} hasClean={true} />);

    expect(screen.getByText("Limpiar vacíos")).toBeInTheDocument();
  });
});
