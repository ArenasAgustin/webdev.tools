import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PlaygroundPage } from "./PlaygroundPage";

describe("PlaygroundPage with an unknown id", () => {
  beforeEach(() => {
    // The static index.html head every route is served with.
    document.head.innerHTML =
      '<meta name="robots" content="index, follow" />' +
      '<link rel="canonical" href="https://arenas-webtools.vercel.app/" />';
  });

  it("shows a noindex not-found page instead of redirecting home (no soft 404)", () => {
    render(
      <MemoryRouter initialEntries={["/playground/does-not-exist"]}>
        <Routes>
          <Route path="/" element={<p>home</p>} />
          <Route path="/playground/:playgroundId" element={<PlaygroundPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByText("home")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Página no encontrada");
    expect(screen.getByRole("link", { name: /volver a todas las herramientas/i })).toHaveAttribute(
      "href",
      "/",
    );
    expect(document.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe("noindex");
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.title).toBe("Página no encontrada - webdev.tools");
  });
});
