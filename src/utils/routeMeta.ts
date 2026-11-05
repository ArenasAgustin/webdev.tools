import { SITE_URL } from "@/utils/constants/site";

/**
 * Per-route document metadata (title, description, canonical/OG URL, OG image, JSON-LD).
 *
 * Single source of truth shared by the runtime `useDocumentMeta` callers and the
 * build-time prerender script, so crawlers that don't run JS see the same values.
 * Pure: callers pass an already-localized name/description and a translate function.
 */

export type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

export const BASE_TITLE = "webdev.tools";

export const HOME_URL = `${SITE_URL}/`;

/** Id of the JSON-LD <script> shared by useDocumentMeta and the prerendered HTML. */
export const JSON_LD_SCRIPT_ID = "json-ld-playground";

export interface RouteMeta {
  title: string;
  description: string;
  keywords: string;
  ogUrl: string;
  ogImage: string;
  jsonLd?: object;
  /** Keep the route out of search results (and drop its canonical). */
  noindex?: boolean;
}

export interface PlaygroundMetaSource {
  id: string;
  name: string;
  description: string;
  keywords?: string[];
}

/** Full document title: the bare brand for the home page, "<title> - webdev.tools" otherwise. */
export function formatDocumentTitle(title: string): string {
  return title === BASE_TITLE ? title : `${title} - ${BASE_TITLE}`;
}

/** Absolute URL of a build-generated Open Graph image (`/og/<slug>.png`). */
export function ogImageUrl(slug: string): string {
  return `${SITE_URL}/og/${slug}.png`;
}

/** Absolute canonical URL of a playground route. */
export function playgroundUrl(id: string): string {
  return `${SITE_URL}/playground/${id}`;
}

export function getHomeMeta(t: TranslateFn): RouteMeta {
  return {
    title: BASE_TITLE,
    description: t("home.meta.description"),
    keywords: t("home.meta.keywords"),
    ogUrl: HOME_URL,
    ogImage: ogImageUrl("home"),
  };
}

export function getPlaygroundMeta(playground: PlaygroundMetaSource, t: TranslateFn): RouteMeta {
  const { id, name, description, keywords } = playground;
  const url = playgroundUrl(id);

  return {
    title: name,
    description: t("page.meta.description", { description }),
    keywords: keywords ? keywords.join(", ") : t("page.meta.keywords", { name, description }),
    ogUrl: url,
    ogImage: ogImageUrl(id),
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name,
      description,
      url,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  };
}

/**
 * Meta for the not-found page shown for an unknown playground id: noindex, so the
 * 200 SPA response is not indexed as a duplicate of the home page (soft 404).
 */
export function getMissingPlaygroundMeta(t: TranslateFn): RouteMeta {
  return {
    title: t("notFound.title"),
    description: t("page.meta.descriptionFallback"),
    keywords: t("page.meta.keywordsFallback"),
    ogUrl: HOME_URL,
    ogImage: ogImageUrl("home"),
    noindex: true,
  };
}
