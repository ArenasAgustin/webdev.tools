import { SITE_URL } from "@/utils/constants/site";
import { HOME_URL, playgroundUrl } from "@/utils/routeMeta";

/**
 * Build-time robots.txt and sitemap.xml content (written by scripts/prerender.mjs
 * from the same playground registry it prerenders). Pure, so it is unit-tested.
 */

/** Absolute URLs of every indexable route: the home page, then each playground. */
export function getSitemapUrls(playgroundIds: readonly string[]): string[] {
  return [HOME_URL, ...playgroundIds.map((id) => playgroundUrl(id))];
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildSitemapXml(playgroundIds: readonly string[]): string {
  const urls = getSitemapUrls(playgroundIds)
    .map((url) => `  <url>\n    <loc>${escapeXml(url)}</loc>\n  </url>`)
    .join("\n");
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    `${urls}\n` +
    "</urlset>\n"
  );
}

export function buildRobotsTxt(): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}
