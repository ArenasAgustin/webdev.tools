/**
 * Keeps Monaco usable offline after a single online visit.
 *
 * Monaco is loaded at runtime from jsDelivr, and the service worker caches those
 * files (CacheFirst, cache MONACO_CACHE_NAME in vite.config.ts) only when it controls
 * the page. On the very first visit Monaco usually loads before the new worker takes
 * control, so nothing would be cached and the editor would be missing offline.
 *
 * Once a service worker is active, the jsDelivr Monaco files this page already loaded
 * (from the Resource Timing entries) are added to that same cache.
 */

/** Must match the runtime cache name of the Monaco route in vite.config.ts. */
export const MONACO_CACHE_NAME = "monaco-editor-v2";

/**
 * Cache used by earlier versions. It can hold opaque (no-cors) responses, which a
 * cross-origin isolated (COEP) context refuses to read back: Cache.match throws and
 * the service worker fails the request, so the editor never loads. It is no longer
 * read, and is deleted here.
 */
export const LEGACY_MONACO_CACHE_NAME = "monaco-editor";

const MONACO_URL = /^https:\/\/cdn\.jsdelivr\.net\/npm\/monaco-editor@[^/]+\/min\/vs\//;

/** The Monaco URLs to cache: the ones the page loaded. */
export function monacoUrlsToCache(loadedUrls: string[]): string[] {
  return [...new Set(loadedUrls.filter((url) => MONACO_URL.test(url)))];
}

/** Add the loaded Monaco files to the service worker's cache; best effort, never throws. */
export async function warmMonacoCache(): Promise<void> {
  try {
    if (!("serviceWorker" in navigator) || typeof caches === "undefined") return;
    await navigator.serviceWorker.ready;
    await caches.delete(LEGACY_MONACO_CACHE_NAME).catch(() => false);
    const loaded = performance.getEntriesByType("resource").map((entry) => entry.name);
    const urls = monacoUrlsToCache(loaded);
    if (urls.length === 0) return;
    const cache = await caches.open(MONACO_CACHE_NAME);
    await Promise.all(
      urls.map(async (url) => {
        if (await cache.match(url)) return;
        // cache.add() fetches in cors mode (jsDelivr sends CORS headers), so the stored
        // response is readable under COEP and can be served to Monaco's script loads.
        await cache.add(url).catch(() => undefined);
      }),
    );
  } catch {
    // Offline caching is an optimization: never let it break the editor.
  }
}
