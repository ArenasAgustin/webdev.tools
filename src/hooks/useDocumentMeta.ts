import { useEffect } from "react";

export interface DocumentMetaOptions {
  title: string;
  description?: string;
  keywords?: string | string[];
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  jsonLd?: object;
}

const BASE_TITLE = "webdev.tools";
const BASE_DESCRIPTION =
  "Suite de herramientas online para desarrolladores: formatear JSON, ejecutar JavaScript, y más. Sin instalación, 100% en el navegador.";
const BASE_URL = "https://webdev.tools";

/**
 * Hook para actualizar meta tags del documento de forma dinámica.
 * Actualiza el título de la página y meta tags de SEO/OpenGraph/Twitter.
 */
export function useDocumentMeta(options: DocumentMetaOptions) {
  useEffect(() => {
    const {
      title,
      description = BASE_DESCRIPTION,
      keywords,
      ogTitle,
      ogDescription,
      ogUrl,
      ogImage,
      twitterTitle,
      twitterDescription,
      jsonLd,
    } = options;

    // Update title
    const fullTitle = title === BASE_TITLE ? title : `${title} - ${BASE_TITLE}`;
    document.title = fullTitle;

    // Update or create meta tags
    const updateMetaTag = (selector: string, content: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        const [attr, value] = selector.includes("property=")
          ? ["property", /property="([^"]+)"/.exec(selector)?.[1] ?? ""]
          : ["name", /name="([^"]+)"/.exec(selector)?.[1] ?? ""];
        element.setAttribute(attr, value);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // SEO meta tags
    updateMetaTag('meta[name="description"]', description);
    if (keywords) {
      const keywordsStr = Array.isArray(keywords) ? keywords.join(", ") : keywords;
      updateMetaTag('meta[name="keywords"]', keywordsStr);
    }

    // Open Graph
    updateMetaTag('meta[property="og:title"]', ogTitle ?? fullTitle);
    updateMetaTag('meta[property="og:description"]', ogDescription ?? description);
    updateMetaTag('meta[property="og:url"]', ogUrl ?? BASE_URL);
    if (ogImage) {
      updateMetaTag('meta[property="og:image"]', ogImage);
    }

    // Twitter Card
    updateMetaTag('meta[name="twitter:title"]', twitterTitle ?? fullTitle);
    updateMetaTag('meta[name="twitter:description"]', twitterDescription ?? description);
    if (ogImage) {
      updateMetaTag('meta[name="twitter:image"]', ogImage);
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", ogUrl ?? BASE_URL);

    // JSON-LD structured data
    if (jsonLd) {
      let script = document.getElementById("json-ld-playground");
      if (!script) {
        script = document.createElement("script");
        script.setAttribute("type", "application/ld+json");
        script.id = "json-ld-playground";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    }

    return () => {
      const script = document.getElementById("json-ld-playground");
      if (script) {
        script.remove();
      }
    };
  }, [options]);
}
