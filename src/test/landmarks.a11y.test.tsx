import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Home } from "@/pages/Home";
import { PlaygroundPage } from "@/pages/PlaygroundPage";

vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() }),
}));

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/playground/:playgroundId" element={<PlaygroundPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("main landmark", () => {
  it("the home page has one main landmark holding the tool list", () => {
    renderAt("/");
    const main = screen.getByRole("main");
    expect(main).toContainElement(screen.getAllByRole("link")[0]);
  });

  it.each(["hash", "password", "colors", "timestamp", "base64", "url"])(
    "the %s playground page has exactly one main landmark",
    async (id) => {
      renderAt(`/playground/${id}`);
      const main = await screen.findByRole("main");
      // The lazy playground renders inside the landmark
      expect(await within(main).findAllByRole("button", {}, { timeout: 5000 })).not.toHaveLength(0);
      expect(screen.getAllByRole("main")).toHaveLength(1);
    },
  );
});
