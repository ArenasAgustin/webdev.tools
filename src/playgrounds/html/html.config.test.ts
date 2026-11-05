import { describe, it, expect, afterEach } from "vitest";
import i18n from "i18next";
import { htmlPlaygroundConfig } from "./html.config";

describe("HTML built-in example follows the UI language", () => {
  afterEach(async () => {
    await i18n.changeLanguage("es");
  });

  it("is in English for the English UI", async () => {
    await i18n.changeLanguage("en");
    const example = htmlPlaygroundConfig.example;
    expect(example).toContain('<html lang="en">');
    expect(example).toContain("<h1>Hello, webdev.tools</h1>");
    expect(example).not.toMatch(/Hola|Este es|Haz click|Hecho/);
  });

  it("stays in Spanish for the Spanish UI", () => {
    const example = htmlPlaygroundConfig.example;
    expect(example).toContain('<html lang="es">');
    expect(example).toContain("<h1>Hola, webdev.tools</h1>");
  });
});
