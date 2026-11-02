import { describe, expect, it } from "vitest";
import { renderRouteHead } from "./prerenderHtml";
import type { RouteMeta } from "./routeMeta";

const shell = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>webdev.tools - Herramientas</title>
    <meta
      name="description"
      content="Home description"
    />
    <meta name="keywords" content="home, keywords" />
    <link rel="canonical" href="https://example.com/" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://example.com/" />
    <meta property="og:title" content="Home title" />
    <meta property="og:description" content="Home description" />
    <meta property="og:image" content="https://example.com/og/home.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="https://example.com/" />
    <meta name="twitter:title" content="Home title" />
    <meta name="twitter:description" content="Home description" />
    <meta name="twitter:image" content="https://example.com/og/home.png" />
  </head>
  <body><div id="root"></div></body>
</html>`;

const meta: RouteMeta = {
  title: "JSON Tools",
  description: 'Formatear "JSON" & más',
  keywords: "JSON formatter, JSONPath",
  ogUrl: "https://example.com/playground/json",
  ogImage: "https://example.com/og/json.png",
  jsonLd: { "@type": "SoftwareApplication", name: "</script><script>alert(1)</script>" },
};

function parse(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

const content = (doc: Document, selector: string) =>
  doc.querySelector(selector)?.getAttribute("content");

describe("renderRouteHead", () => {
  const doc = parse(renderRouteHead(shell, meta));

  it("sets the full document title", () => {
    expect(doc.title).toBe("JSON Tools - webdev.tools");
  });

  it("sets description, keywords and canonical", () => {
    expect(content(doc, 'meta[name="description"]')).toBe('Formatear "JSON" & más');
    expect(content(doc, 'meta[name="keywords"]')).toBe("JSON formatter, JSONPath");
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      "https://example.com/playground/json",
    );
  });

  it("sets the Open Graph tags", () => {
    expect(content(doc, 'meta[property="og:url"]')).toBe("https://example.com/playground/json");
    expect(content(doc, 'meta[property="og:title"]')).toBe("JSON Tools - webdev.tools");
    expect(content(doc, 'meta[property="og:description"]')).toBe('Formatear "JSON" & más');
    expect(content(doc, 'meta[property="og:image"]')).toBe("https://example.com/og/json.png");
  });

  it("sets the Twitter tags", () => {
    expect(content(doc, 'meta[name="twitter:url"]')).toBe("https://example.com/playground/json");
    expect(content(doc, 'meta[name="twitter:title"]')).toBe("JSON Tools - webdev.tools");
    expect(content(doc, 'meta[name="twitter:description"]')).toBe('Formatear "JSON" & más');
    expect(content(doc, 'meta[name="twitter:image"]')).toBe("https://example.com/og/json.png");
  });

  it("leaves unrelated tags untouched", () => {
    expect(content(doc, 'meta[property="og:type"]')).toBe("website");
    expect(content(doc, 'meta[name="twitter:card"]')).toBe("summary_large_image");
    expect(doc.querySelectorAll('meta[name="description"]')).toHaveLength(1);
  });

  it("embeds JSON-LD with the id the runtime hook reuses, safely escaped", () => {
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');

    expect(scripts).toHaveLength(1);
    expect(scripts[0].id).toBe("json-ld-playground");
    expect(JSON.parse(scripts[0].textContent ?? "")).toEqual(meta.jsonLd);
    expect(doc.querySelectorAll("script")).toHaveLength(1);
  });

  it("adds tags that are missing from the shell", () => {
    const minimal = "<html><head><title>x</title></head><body></body></html>";
    const out = parse(renderRouteHead(minimal, { ...meta, jsonLd: undefined }));

    expect(content(out, 'meta[property="og:image"]')).toBe("https://example.com/og/json.png");
    expect(content(out, 'meta[name="twitter:title"]')).toBe("JSON Tools - webdev.tools");
    expect(out.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      "https://example.com/playground/json",
    );
    expect(out.querySelector('script[type="application/ld+json"]')).toBeNull();
  });
});
