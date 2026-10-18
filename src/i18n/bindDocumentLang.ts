import type { i18n as I18n } from "i18next";

/**
 * Keep `<html lang>` in sync with the active i18n language so assistive
 * technology reads content with the right voice. Uses the resolved language
 * (e.g. "es-ES" → "es", unsupported → fallback). Returns an unbind function.
 */
export function bindDocumentLang(instance: I18n): () => void {
  const sync = () => {
    // resolvedLanguage is not yet set when languageChanged fires during init,
    // so resolve from the fallback chain (e.g. ["es-ES", "es", "en"]).
    const lng =
      instance.languages?.find((code) => instance.hasResourceBundle(code, "translation")) ??
      instance.language;
    if (lng) document.documentElement.lang = lng;
  };
  instance.on("languageChanged", sync);
  return () => instance.off("languageChanged", sync);
}
