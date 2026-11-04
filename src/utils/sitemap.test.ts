import { describe, it, expect } from "vitest";
import { buildRobotsTxt, buildSitemapXml, getSitemapUrls } from "./sitemap";
import { SITE_URL } from "@/utils/constants/site";
import { playgroundRegistry } from "@/playgrounds/registry";

describe("sitemap", () => {
  it("lists the home page and every playground route", () => {
    const urls = getSitemapUrls(["json", "sql"]);
    expect(urls).toEqual([
      `${SITE_URL}/`,
      `${SITE_URL}/playground/json`,
      `${SITE_URL}/playground/sql`,
    ]);
  });

  it("covers the whole playground registry", () => {
    const xml = buildSitemapXml(playgroundRegistry.map((playground) => playground.id));
    for (const { id } of playgroundRegistry) {
      expect(xml).toContain(`<loc>${SITE_URL}/playground/${id}</loc>`);
    }
    expect(xml).toContain(`<loc>${SITE_URL}/</loc>`);
  });

  it("is a valid urlset document with escaped URLs", () => {
    const xml = buildSitemapXml(["a&b"]);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain(`<loc>${SITE_URL}/playground/a&amp;b</loc>`);
    expect(xml.trimEnd().endsWith("</urlset>")).toBe(true);
  });
});

describe("robots.txt", () => {
  it("allows every crawler and points at the sitemap", () => {
    expect(buildRobotsTxt()).toBe(
      `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
    );
  });
});
