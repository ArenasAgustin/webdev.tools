import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import i18next from "i18next";
import { runnerImport } from "vite";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const DIST = path.join(ROOT, "dist");

/** Crawlers get the site's default language (the app falls back to Spanish copy). */
export const DEFAULT_LANGUAGE = "es";

/**
 * @param {string | Record<string, string>} value
 * @returns {string}
 */
function localize(value) {
  if (typeof value === "string") return value;
  return value[DEFAULT_LANGUAGE] ?? Object.values(value)[0] ?? "";
}

/**
 * Loads the shared SEO helpers, a translate function for DEFAULT_LANGUAGE and the
 * playgrounds (localized name/description) used by the og-images and prerender scripts.
 */
export async function loadSiteData() {
  const { module: seo } = await runnerImport(path.join(ROOT, "scripts/lib/seo-entry.mjs"), {
    configFile: false,
    root: ROOT,
    logLevel: "error",
    resolve: { alias: { "@": path.join(ROOT, "src") } },
  });

  const translation = JSON.parse(
    await readFile(path.join(ROOT, `src/locales/${DEFAULT_LANGUAGE}/translation.json`), "utf8"),
  );
  const i18n = i18next.createInstance();
  await i18n.init({
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    resources: { [DEFAULT_LANGUAGE]: { translation } },
    interpolation: { escapeValue: false },
  });

  /** @type {(key: string, options?: Record<string, unknown>) => string} */
  const t = (key, options) => i18n.t(key, options);

  const playgrounds = seo.playgroundRegistry.map((playground) => ({
    id: playground.id,
    name: localize(playground.name),
    description: localize(playground.description),
    keywords: playground.keywords,
  }));

  return { seo, t, playgrounds };
}
