import { describe, expect, it } from "vitest";
import { SITE_URL } from "@/utils/constants/site";
import {
  BASE_TITLE,
  formatDocumentTitle,
  getHomeMeta,
  getMissingPlaygroundMeta,
  getPlaygroundMeta,
  ogImageUrl,
  type TranslateFn,
} from "./routeMeta";

/** Echoes the key and its interpolation values so assertions see what was asked for. */
const t: TranslateFn = (key, options) =>
  options ? `${key}|${JSON.stringify(options)}` : key;

const jsonPlayground = {
  id: "json",
  name: "JSON Tools",
  description: "Formatear, minificar y filtrar JSON",
  keywords: ["JSON formatter", "JSONPath"],
};

describe("formatDocumentTitle", () => {
  it("keeps the bare brand title", () => {
    expect(formatDocumentTitle(BASE_TITLE)).toBe("webdev.tools");
  });

  it("suffixes any other title with the brand", () => {
    expect(formatDocumentTitle("JSON Tools")).toBe("JSON Tools - webdev.tools");
  });
});

describe("ogImageUrl", () => {
  it("builds an absolute PNG URL under /og", () => {
    expect(ogImageUrl("json")).toBe(`${SITE_URL}/og/json.png`);
  });
});

describe("getHomeMeta", () => {
  it("describes the home route with the home OG image", () => {
    expect(getHomeMeta(t)).toEqual({
      title: "webdev.tools",
      description: "home.meta.description",
      keywords: "home.meta.keywords",
      ogUrl: `${SITE_URL}/`,
      ogImage: `${SITE_URL}/og/home.png`,
    });
  });
});

describe("getPlaygroundMeta", () => {
  it("builds title, description, URLs and keywords for a playground", () => {
    const meta = getPlaygroundMeta(jsonPlayground, t);

    expect(meta.title).toBe("JSON Tools");
    expect(meta.description).toBe(
      'page.meta.description|{"description":"Formatear, minificar y filtrar JSON"}',
    );
    expect(meta.keywords).toBe("JSON formatter, JSONPath");
    expect(meta.ogUrl).toBe(`${SITE_URL}/playground/json`);
    expect(meta.ogImage).toBe(`${SITE_URL}/og/json.png`);
  });

  it("falls back to translated keywords when the playground has none", () => {
    const meta = getPlaygroundMeta({ ...jsonPlayground, keywords: undefined }, t);

    expect(meta.keywords).toBe(
      'page.meta.keywords|{"name":"JSON Tools","description":"Formatear, minificar y filtrar JSON"}',
    );
  });

  it("adds SoftwareApplication JSON-LD pointing at the playground URL", () => {
    expect(getPlaygroundMeta(jsonPlayground, t).jsonLd).toEqual({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "JSON Tools",
      description: "Formatear, minificar y filtrar JSON",
      url: `${SITE_URL}/playground/json`,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    });
  });
});

describe("getMissingPlaygroundMeta", () => {
  it("is a not-found page kept out of the index (no home canonical)", () => {
    expect(getMissingPlaygroundMeta(t)).toEqual({
      title: "notFound.title",
      description: "page.meta.descriptionFallback",
      keywords: "page.meta.keywordsFallback",
      ogUrl: `${SITE_URL}/`,
      ogImage: `${SITE_URL}/og/home.png`,
      noindex: true,
    });
  });
});
