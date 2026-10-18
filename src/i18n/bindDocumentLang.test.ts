import { describe, it, expect, afterEach } from "vitest";
import { createInstance } from "i18next";
import { bindDocumentLang } from "./bindDocumentLang";

const originalLang = document.documentElement.lang;

async function createI18n(lng: string) {
  const instance = createInstance();
  const unbind = bindDocumentLang(instance);
  await instance.init({
    lng,
    fallbackLng: "en",
    supportedLngs: ["es", "en"],
    nonExplicitSupportedLngs: true,
    resources: { es: { translation: {} }, en: { translation: {} } },
  });
  return { instance, unbind };
}

describe("bindDocumentLang", () => {
  afterEach(() => {
    document.documentElement.lang = originalLang;
  });

  it("sets <html lang> to the initial language", async () => {
    document.documentElement.lang = "";
    await createI18n("en");

    expect(document.documentElement.lang).toBe("en");
  });

  it("updates <html lang> when the language changes", async () => {
    const { instance } = await createI18n("es");
    expect(document.documentElement.lang).toBe("es");

    await instance.changeLanguage("en");

    expect(document.documentElement.lang).toBe("en");
  });

  it("uses the resolved language for regional codes", async () => {
    await createI18n("es-ES");

    expect(document.documentElement.lang).toBe("es");
  });

  it("uses the fallback language when the requested one is unsupported", async () => {
    const { instance } = await createI18n("es");

    await instance.changeLanguage("fr");

    expect(document.documentElement.lang).toBe("en");
  });

  it("stops syncing after unbinding", async () => {
    const { instance, unbind } = await createI18n("es");

    unbind();
    await instance.changeLanguage("en");

    expect(document.documentElement.lang).toBe("es");
  });
});
