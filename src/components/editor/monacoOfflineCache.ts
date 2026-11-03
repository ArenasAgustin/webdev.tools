/**
 * Keeps Monaco usable offline after a single online visit.
 *
 * Monaco is loaded at runtime from jsDelivr, and the service worker caches those
 * files (CacheFirst, cache "monaco-editor" in vite.config.ts) only when it controls
 * the page. On the very first visit Monaco usually loads before the new worker takes
 * control, so nothing would be cached and the editor would be missing offline.
 *
 * Once a service worker is active, the jsDelivr Monaco files this page already loaded
 * (from the Resource Timing entries) are added to that same cache, plus the worker
 * bootstrap script, which loads inside a web worker and so is not listed there.
 */

/** Must match the runtime cache name of the Monaco route in vite.config.ts. */
export const MONACO_CACHE_NAME = "monaco-editor";

const MONACO_URL = /^https:\/\/cdn\.jsdelivr\.net\/npm\/monaco-editor@[^/]+\/min\/vs\//;
const LOADER_SUFFIX = "/vs/loader.js";
const WORKER_MAIN = "/vs/base/worker/workerMain.js";

/** The Monaco URLs to cache: the ones the page loaded, plus the worker bootstrap. */
export function monacoUrlsToCache(loadedUrls: string[]): string[] {
  const urls = new Set(loadedUrls.filter((url) => MONACO_URL.test(url)));
  const loader = [...urls].find((url) => url.endsWith(LOADER_SUFFIX));
  if (loader) urls.add(loader.slice(0, -LOADER_SUFFIX.length) + WORKER_MAIN);
  return [...urls];
}

/** Add the loaded Monaco files to the service worker's cache; best effort, never throws. */
export async function warmMonacoCache(): Promise<void> {
  try {
    if (!("serviceWorker" in navigator) || typeof caches === "undefined") return;
    await navigator.serviceWorker.ready;
    const loaded = performance.getEntriesByType("resource").map((entry) => entry.name);
    const urls = monacoUrlsToCache(loaded);
    if (urls.length === 0) return;
    const cache = await caches.open(MONACO_CACHE_NAME);
    await Promise.all(
      urls.map(async (url) => {
        if (await cache.match(url)) return;
        // jsDelivr sends CORS headers, so a cors response can be stored and served
        // later to Monaco's no-cors <script> loads (the cache matches by URL).
        await cache.add(url).catch(() => undefined);
      }),
    );
  } catch {
    // Offline caching is an optimization: never let it break the editor.
  }
}
