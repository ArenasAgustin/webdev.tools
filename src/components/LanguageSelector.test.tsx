import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { LanguageSelector } from "./LanguageSelector";

async function renderWithLanguage(lng: string) {
  const i18n = createInstance();
  await i18n.use(initReactI18next).init({
    lng,
    fallbackLng: "en",
    // resolvedLanguage only resolves to languages whose bundle has keys
    resources: { es: { translation: { hello: "hola" } }, en: { translation: { hello: "hello" } } },
  });
  render(
    <I18nextProvider i18n={i18n}>
      <LanguageSelector />
    </I18nextProvider>,
  );
  return i18n;
}

describe("LanguageSelector", () => {
  it.each([
    ["en-US", "EN"],
    ["es-AR", "ES"],
    ["fr-FR", "EN"],
    ["es", "ES"],
  ])("shows the language in use for the browser locale %s", async (lng, label) => {
    await renderWithLanguage(lng);

    expect(screen.getByRole("button", { name: "language.select" })).toHaveTextContent(label);
  });
  it("opens a menu of radio items with the current language checked and focused", async () => {
    await renderWithLanguage("es");
    const trigger = screen.getByRole("button", { name: "language.select" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");

    fireEvent.click(trigger);

    const items = screen.getAllByRole("menuitemradio");
    expect(items.map((item) => item.textContent)).toEqual(["ES", "EN"]);
    expect(items[0]).toHaveAttribute("aria-checked", "true");
    expect(items[0]).toHaveFocus();
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("moves with the arrow keys, closes on Escape and returns focus", async () => {
    await renderWithLanguage("es");
    const trigger = screen.getByRole("button", { name: "language.select" });
    fireEvent.click(trigger);
    const items = screen.getAllByRole("menuitemradio");

    fireEvent.keyDown(items[0], { key: "ArrowDown" });
    expect(items[1]).toHaveFocus();
    fireEvent.keyDown(items[1], { key: "ArrowDown" });
    expect(items[0]).toHaveFocus();
    fireEvent.keyDown(items[0], { key: "ArrowUp" });
    expect(items[1]).toHaveFocus();

    fireEvent.keyDown(items[1], { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("changes the language from the keyboard", async () => {
    const i18n = await renderWithLanguage("es");
    fireEvent.click(screen.getByRole("button", { name: "language.select" }));
    const items = screen.getAllByRole("menuitemradio");
    fireEvent.keyDown(items[0], { key: "ArrowDown" });
    fireEvent.click(items[1]);

    expect(i18n.resolvedLanguage).toBe("en");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
