import { describe, it, expect, vi, afterEach } from "vitest";
import {
  monacoUrlsToCache,
  warmMonacoCache,
  MONACO_CACHE_NAME,
  LEGACY_MONACO_CACHE_NAME,
} from "./monacoOfflineCache";

const BASE = "https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs";

describe("monacoUrlsToCache", () => {
  it("keeps only the loaded Monaco files", () => {
    const urls = monacoUrlsToCache([
      `${BASE}/loader.js`,
      `${BASE}/editor/editor.main.js`,
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css",
      "http://localhost/assets/index.js",
    ]);

    // Monaco 0.55 has no vs/base/worker/workerMain.js (it 404s), so nothing is added.
    expect(urls).toEqual([`${BASE}/loader.js`, `${BASE}/editor/editor.main.js`]);
  });

  it("returns nothing when Monaco was not loaded", () => {
    expect(monacoUrlsToCache(["http://localhost/assets/index.js"])).toEqual([]);
  });
});

describe("warmMonacoCache", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    Reflect.deleteProperty(navigator, "serviceWorker");
  });

  function setup(cachedUrls: string[] = []) {
    const cached = new Set(cachedUrls);
    const cache = {
      match: vi.fn((url: string) =>
        Promise.resolve(cached.has(url) ? new Response("") : undefined),
      ),
      add: vi.fn(() => Promise.resolve()),
    };
    const open = vi.fn(() => Promise.resolve(cache));
    const del = vi.fn(() => Promise.resolve(true));
    vi.stubGlobal("caches", { open, delete: del });
    Object.defineProperty(navigator, "serviceWorker", {
      value: { ready: Promise.resolve({}) },
      configurable: true,
    });
    return { cache, open, del };
  }

  it("adds the Monaco files loaded before the service worker took control to its cache", async () => {
    const { cache, open } = setup([`${BASE}/loader.js`]);
    vi.spyOn(performance, "getEntriesByType").mockReturnValue([
      { name: `${BASE}/loader.js` },
      { name: `${BASE}/editor/editor.main.js` },
    ] as PerformanceEntryList);

    await warmMonacoCache();

    expect(open).toHaveBeenCalledWith(MONACO_CACHE_NAME);
    expect(cache.add).toHaveBeenCalledTimes(1);
    expect(cache.add).toHaveBeenCalledWith(`${BASE}/editor/editor.main.js`);
  });

  it("uses a new cache name, so opaque responses stored by older versions are never read", () => {
    expect(MONACO_CACHE_NAME).not.toBe(LEGACY_MONACO_CACHE_NAME);
  });

  it("deletes the legacy cache, whose opaque entries fail under COEP", async () => {
    const { del } = setup();
    vi.spyOn(performance, "getEntriesByType").mockReturnValue([]);

    await warmMonacoCache();

    expect(del).toHaveBeenCalledWith(LEGACY_MONACO_CACHE_NAME);
  });

  it("does nothing without service worker support", async () => {
    const open = vi.fn();
    vi.stubGlobal("caches", { open });

    await expect(warmMonacoCache()).resolves.toBeUndefined();
    expect(open).not.toHaveBeenCalled();
  });
});
