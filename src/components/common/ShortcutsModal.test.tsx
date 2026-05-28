import { describe, it, expect, vi } from "vitest";
import { renderWithI18n } from "@/test/test-utils";
import { ShortcutsModal } from "./ShortcutsModal";

describe("ShortcutsModal", () => {
  it("hides modal content when isOpen is false", () => {
    const { queryByText } = renderWithI18n(<ShortcutsModal isOpen={false} onClose={vi.fn()} />);

    expect(queryByText("Atajos de teclado")).not.toBeInTheDocument();
  });

  it("shows modal content when isOpen is true", () => {
    const { getByText } = renderWithI18n(<ShortcutsModal isOpen={true} onClose={vi.fn()} />);

    expect(getByText("Atajos de teclado")).toBeInTheDocument();
  });

  it("does not render 'Limpiar vacíos' row when hasClean is not provided", () => {
    const { queryByText } = renderWithI18n(<ShortcutsModal isOpen={true} onClose={vi.fn()} />);

    expect(queryByText("Limpiar vacíos")).not.toBeInTheDocument();
  });

  it("does not render 'Limpiar vacíos' row when hasClean is false", () => {
    const { queryByText } = renderWithI18n(<ShortcutsModal isOpen={true} onClose={vi.fn()} hasClean={false} />);

    expect(queryByText("Limpiar vacíos")).not.toBeInTheDocument();
  });

  it("renders 'Limpiar vacíos' row when hasClean is true", () => {
    const { getByText } = renderWithI18n(<ShortcutsModal isOpen={true} onClose={vi.fn()} hasClean={true} />);

    expect(getByText("Limpiar vacíos")).toBeInTheDocument();
  });
});
