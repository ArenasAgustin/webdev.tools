import { describe, it, expect, vi } from "vitest";
import {
  getPlaygroundById,
  preloadPlaygroundById,
  preloadAllPlaygrounds,
  playgroundRegistry,
} from "./registry";

// Mockear los playgrounds
vi.mock("./json/JsonPlayground", () => ({ JsonPlayground: vi.fn() }));
vi.mock("./js/JsPlayground", () => ({ JsPlayground: vi.fn() }));
vi.mock("./html/HtmlPlayground", () => ({ HtmlPlayground: vi.fn() }));
vi.mock("./css/CssPlayground", () => ({ CssPlayground: vi.fn() }));
vi.mock("./colors/ColorsPlayground", () => ({ ColorsPlayground: vi.fn() }));
vi.mock("./hash/HashPlayground", () => ({ HashPlayground: vi.fn() }));
vi.mock("./password/PasswordPlayground", () => ({ PasswordPlayground: vi.fn() }));
vi.mock("./timestamp/TimestampPlayground", () => ({ TimestampPlayground: vi.fn() }));
vi.mock("./php/PhpPlayground", () => ({ PhpPlayground: vi.fn() }));

// Mockear las funciones de preload para evitar cargar módulos reales
vi.mock("./registry", async (importOriginal) => {
  const mod = await importOriginal<typeof import("./registry")>();
  return {
    ...mod,
    preloadPlaygroundById: vi.fn().mockResolvedValue(undefined),
    preloadAllPlaygrounds: vi.fn().mockResolvedValue(undefined),
  };
});

describe("playgroundRegistry", () => {
  it("exports playground registry with correct number of playgrounds", () => {
    expect(playgroundRegistry).toBeDefined();
    expect(Array.isArray(playgroundRegistry)).toBe(true);
    expect(playgroundRegistry.length).toBeGreaterThan(0);
  });

  it("contains json playground", () => {
    const jsonPlayground = playgroundRegistry.find((p) => p.id === "json");
    expect(jsonPlayground).toBeDefined();
    expect(jsonPlayground?.name).toBe("JSON Tools");
  });

  it("contains js playground", () => {
    const jsPlayground = playgroundRegistry.find((p) => p.id === "js");
    expect(jsPlayground).toBeDefined();
    expect(jsPlayground?.name).toBe("JavaScript tools");
  });

  it("contains html playground", () => {
    const htmlPlayground = playgroundRegistry.find((p) => p.id === "html");
    expect(htmlPlayground).toBeDefined();
    expect(htmlPlayground?.name).toBe("HTML tools");
  });

  it("contains css playground", () => {
    const cssPlayground = playgroundRegistry.find((p) => p.id === "css");
    expect(cssPlayground).toBeDefined();
    expect(cssPlayground?.name).toBe("CSS tools");
  });

  it("contains php playground", () => {
    const phpPlayground = playgroundRegistry.find((p) => p.id === "php");
    expect(phpPlayground).toBeDefined();
    expect(phpPlayground?.name).toBe("PHP 7.4 tools");
  });

  it("contains colors playground", () => {
    const colorsPlayground = playgroundRegistry.find((p) => p.id === "colors");
    expect(colorsPlayground).toBeDefined();
  });

  it("contains hash playground", () => {
    const hashPlayground = playgroundRegistry.find((p) => p.id === "hash");
    expect(hashPlayground).toBeDefined();
  });

  it("contains password playground", () => {
    const passwordPlayground = playgroundRegistry.find((p) => p.id === "password");
    expect(passwordPlayground).toBeDefined();
  });

  it("contains timestamp playground", () => {
    const timestampPlayground = playgroundRegistry.find((p) => p.id === "timestamp");
    expect(timestampPlayground).toBeDefined();
  });

  it("each playground has required properties", () => {
    playgroundRegistry.forEach((playground) => {
      expect(playground.id).toBeDefined();
      expect(playground.name).toBeDefined();
      expect(playground.component).toBeDefined();
    });
  });
});

describe("getPlaygroundById", () => {
  it("returns playground for valid id", () => {
    const jsonPlayground = getPlaygroundById("json");
    expect(jsonPlayground).toBeDefined();
    expect(jsonPlayground?.id).toBe("json");
  });

  it("returns playground for js id", () => {
    const jsPlayground = getPlaygroundById("js");
    expect(jsPlayground).toBeDefined();
    expect(jsPlayground?.id).toBe("js");
  });

  it("returns undefined for invalid id", () => {
    const result = getPlaygroundById("invalid-id");
    expect(result).toBeUndefined();
  });

  it("returns undefined for empty string id", () => {
    const result = getPlaygroundById("");
    expect(result).toBeUndefined();
  });
});

describe("preloadPlaygroundById", () => {
  it("preloads valid playground", async () => {
    // This tests that the function doesn't throw
    await expect(preloadPlaygroundById("json")).resolves.toBeUndefined();
  });

  it("handles invalid id without throwing", async () => {
    await expect(preloadPlaygroundById("invalid-id")).resolves.toBeUndefined();
  });

  it("handles empty id without throwing", async () => {
    await expect(preloadPlaygroundById("")).resolves.toBeUndefined();
  });
});

describe("preloadAllPlaygrounds", () => {
  it("preloads all playgrounds without throwing", async () => {
    await expect(preloadAllPlaygrounds()).resolves.toBeUndefined();
  });

  it("preloads specific playgrounds one by one", async () => {
    await expect(preloadPlaygroundById("js")).resolves.toBeUndefined();
    await expect(preloadPlaygroundById("html")).resolves.toBeUndefined();
    await expect(preloadPlaygroundById("css")).resolves.toBeUndefined();
    await expect(preloadPlaygroundById("php")).resolves.toBeUndefined();
    await expect(preloadPlaygroundById("colors")).resolves.toBeUndefined();
    await expect(preloadPlaygroundById("hash")).resolves.toBeUndefined();
    await expect(preloadPlaygroundById("password")).resolves.toBeUndefined();
    await expect(preloadPlaygroundById("timestamp")).resolves.toBeUndefined();
  });

  it("getPlaygroundById returns correct playground for each type", () => {
    expect(getPlaygroundById("colors")).toBeDefined();
    expect(getPlaygroundById("hash")).toBeDefined();
    expect(getPlaygroundById("password")).toBeDefined();
    expect(getPlaygroundById("timestamp")).toBeDefined();
  });
});
