import { describe, it, expect, vi, afterEach } from "vitest";
import { monacoUrlsToCache, warmMonacoCache, MONACO_CACHE_NAME } from "./monacoOfflineCache";

const BASE = "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs";

describe("monacoUrlsToCache", () => {
  it("keeps the loaded Monaco files and adds the worker bootstrap", () => {
    const urls = monacoUrlsToCache([
      `${BASE}/loader.js`,
      `${BASE}/editor/editor.main.js`,
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css",
      "http://localhost/assets/index.js",
    ]);

    expect(urls).toEqual([
      `${BASE}/loader.js`,
      `${BASE}/editor/editor.main.js`,
      `${BASE}/base/worker/workerMain.js`,
    ]);
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

  it("adds the Monaco files loaded before the service worker took control to its cache", async () => {
    const cached = new Set([`${BASE}/loader.js`]);
    const cache = {
      match: vi.fn((url: string) => Promise.resolve(cached.has(url) ? new Response("") : undefined)),
      add: vi.fn(() => Promise.resolve()),
    };
    const open = vi.fn(() => Promise.resolve(cache));
    vi.stubGlobal("caches", { open });
    Object.defineProperty(navigator, "serviceWorker", {
      value: { ready: Promise.resolve({}) },
      configurable: true,
    });
    vi.spyOn(performance, "getEntriesByType").mockReturnValue([
      { name: `${BASE}/loader.js` },
      { name: `${BASE}/editor/editor.main.js` },
    ] as PerformanceEntryList);

    await warmMonacoCache();

    expect(open).toHaveBeenCalledWith(MONACO_CACHE_NAME);
    expect(cache.add).toHaveBeenCalledTimes(2);
    expect(cache.add).toHaveBeenCalledWith(`${BASE}/editor/editor.main.js`);
    expect(cache.add).toHaveBeenCalledWith(`${BASE}/base/worker/workerMain.js`);
  });

  it("does nothing without service worker support", async () => {
    const open = vi.fn();
    vi.stubGlobal("caches", { open });

    await expect(warmMonacoCache()).resolves.toBeUndefined();
    expect(open).not.toHaveBeenCalled();
  });
});
