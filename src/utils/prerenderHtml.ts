import { formatDocumentTitle, JSON_LD_SCRIPT_ID, type RouteMeta } from "@/utils/routeMeta";

/**
 * Rewrites the <head> of the built index.html for one route (used by scripts/prerender.mjs).
 * Mirrors what useDocumentMeta sets at runtime so crawlers that don't run JS see the
 * route's title, description, canonical, Open Graph, Twitter and JSON-LD values.
 */

const escapeAttr = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const escapeText = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** JSON is safe inside <script> once "<" can't open a closing tag or comment. */
const escapeJsonForScript = (value: object) => JSON.stringify(value).replace(/</g, "\\u003c");

function insertBeforeHeadEnd(html: string, tag: string): string {
  return html.replace(/<\/head>/i, () => `${tag}\n</head>`);
}

/** Replaces the `content` of `<meta {key}="{name}">`, or appends that tag when missing. */
function setMeta(html: string, key: "name" | "property", name: string, value: string): string {
  const tagPattern = new RegExp(`<meta\\b[^>]*\\b${key}="${name}"[^>]*>`, "i");
  const match = tagPattern.exec(html);
  if (!match) {
    return insertBeforeHeadEnd(html, `<meta ${key}="${name}" content="${escapeAttr(value)}" />`);
  }
  const updated = match[0].replace(/\bcontent="[^"]*"/i, () => `content="${escapeAttr(value)}"`);
  return html.slice(0, match.index) + updated + html.slice(match.index + match[0].length);
}

function setCanonical(html: string, href: string): string {
  const tag = `<link rel="canonical" href="${escapeAttr(href)}" />`;
  const pattern = /<link\b[^>]*\brel="canonical"[^>]*>/i;
  return pattern.test(html) ? html.replace(pattern, () => tag) : insertBeforeHeadEnd(html, tag);
}

function setTitle(html: string, title: string): string {
  const tag = `<title>${escapeText(title)}</title>`;
  const pattern = /<title>[\s\S]*?<\/title>/i;
  return pattern.test(html) ? html.replace(pattern, () => tag) : insertBeforeHeadEnd(html, tag);
}

export function renderRouteHead(html: string, meta: RouteMeta): string {
  const fullTitle = formatDocumentTitle(meta.title);

  let out = setTitle(html, fullTitle);
  out = setMeta(out, "name", "description", meta.description);
  out = setMeta(out, "name", "keywords", meta.keywords);
  out = setCanonical(out, meta.ogUrl);

  out = setMeta(out, "property", "og:url", meta.ogUrl);
  out = setMeta(out, "property", "og:title", fullTitle);
  out = setMeta(out, "property", "og:description", meta.description);
  out = setMeta(out, "property", "og:image", meta.ogImage);

  out = setMeta(out, "name", "twitter:url", meta.ogUrl);
  out = setMeta(out, "name", "twitter:title", fullTitle);
  out = setMeta(out, "name", "twitter:description", meta.description);
  out = setMeta(out, "name", "twitter:image", meta.ogImage);

  if (meta.jsonLd) {
    out = insertBeforeHeadEnd(
      out,
      `<script type="application/ld+json" id="${JSON_LD_SCRIPT_ID}">${escapeJsonForScript(meta.jsonLd)}</script>`,
    );
  }

  return out;
}
