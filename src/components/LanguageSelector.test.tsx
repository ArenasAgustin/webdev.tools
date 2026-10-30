import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
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
});
