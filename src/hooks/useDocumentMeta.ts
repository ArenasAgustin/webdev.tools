import { useEffect } from "react";

export interface DocumentMetaOptions {
  title: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
  twitterTitle?: string;
  twitterDescription?: string;
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
      twitterTitle,
      twitterDescription,
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
      updateMetaTag('meta[name="keywords"]', keywords);
    }

    // Open Graph
    updateMetaTag('meta[property="og:title"]', ogTitle ?? fullTitle);
    updateMetaTag('meta[property="og:description"]', ogDescription ?? description);
    updateMetaTag('meta[property="og:url"]', ogUrl ?? BASE_URL);

    // Twitter Card
    updateMetaTag('meta[name="twitter:title"]', twitterTitle ?? fullTitle);
    updateMetaTag('meta[name="twitter:description"]', twitterDescription ?? description);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", ogUrl ?? BASE_URL);
  }, [options]);
}
