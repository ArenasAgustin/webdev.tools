import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import i18n from "i18next";
import { Home } from "./Home";

describe("Home", () => {
  afterEach(async () => {
    await act(() => i18n.changeLanguage("es"));
  });

  it("lets the user switch the language from the header", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    const banner = screen.getByRole("banner");
    fireEvent.click(screen.getByRole("button", { name: "Seleccionar idioma" }));
    expect(banner).toContainElement(screen.getByRole("menu"));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "EN" }));

    expect(i18n.resolvedLanguage).toBe("en");
  });
});
