import i18n from "i18next";

/**
 * Translate a key outside React components (hooks callbacks, utils).
 *
 * Reads the shared i18next singleton at call time, so messages follow the
 * language active when they are produced. Import this helper rather than
 * `src/i18n/index.ts`, which initializes i18next as a side effect.
 */
export function translate(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options);
}
