import { SITE_URL } from "@/utils/constants/site";
import { BASE_TITLE, type PlaygroundMetaSource, type TranslateFn } from "@/utils/routeMeta";

/**
 * Open Graph image template rendered at build time by scripts/og-images.mjs (satori + resvg).
 * Pure data: returns a satori-compatible element tree, so it is testable without a renderer.
 * Colors follow DESIGN.md (background #020617, cyan/blue accents, white text).
 */

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

export type OgStyle = Record<string, string | number>;

export interface OgNode {
  type: "div";
  props: {
    style?: OgStyle;
    children?: (OgNode | string)[] | OgNode | string;
  };
}

export interface OgCard {
  /** Output file name: `og/<slug>.png`. */
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  /** Tool names listed on the home card; empty for playground cards. */
  chips: string[];
  footer: string;
}

const COLORS = {
  background: "#020617",
  textPrimary: "#ffffff",
  textSecondary: "#cbd5e1",
  textMuted: "#94a3b8",
  accent: "#22d3ee",
  accentBlue: "#60a5fa",
  border: "rgba(255,255,255,0.12)",
  surface: "rgba(255,255,255,0.06)",
};

const SITE_HOST = new URL(SITE_URL).host;

/** Home card first, then one card per playground in registry order. */
export function getOgCards(playgrounds: PlaygroundMetaSource[], t: TranslateFn): OgCard[] {
  const home: OgCard = {
    slug: "home",
    eyebrow: t("home.tagline"),
    title: BASE_TITLE,
    description: t("home.headline"),
    chips: playgrounds.map((playground) => playground.name),
    footer: SITE_HOST,
  };

  return [
    home,
    ...playgrounds.map((playground) => ({
      slug: playground.id,
      eyebrow: t("page.playground"),
      title: playground.name,
      description: playground.description,
      chips: [],
      footer: `${SITE_HOST}/playground/${playground.id}`,
    })),
  ];
}

const div = (style: OgStyle, children?: OgNode["props"]["children"]): OgNode => ({
  type: "div",
  props: children === undefined ? { style } : { style, children },
});

function brandRow(): OgNode {
  return div({ display: "flex", alignItems: "center", gap: 16 }, [
    div({
      width: 20,
      height: 20,
      borderRadius: 9999,
      backgroundImage: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentBlue})`,
    }),
    div({ fontSize: 32, fontWeight: 700, color: COLORS.textPrimary }, BASE_TITLE),
  ]);
}

function chipList(chips: string[]): OgNode {
  return div(
    { display: "flex", flexWrap: "wrap", gap: 10 },
    chips.map((chip) =>
      div(
        {
          fontSize: 19,
          color: COLORS.textSecondary,
          padding: "6px 14px",
          borderRadius: 9999,
          border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.surface,
        },
        chip,
      ),
    ),
  );
}

export function buildOgImageTree(card: OgCard): OgNode {
  const isHome = card.chips.length > 0;

  const body = div({ display: "flex", flexDirection: "column", gap: isHome ? 14 : 20 }, [
    div(
      {
        fontSize: 22,
        fontWeight: 500,
        letterSpacing: 6,
        textTransform: "uppercase",
        color: COLORS.accent,
      },
      card.eyebrow,
    ),
    div(
      { fontSize: isHome ? 72 : 96, fontWeight: 700, lineHeight: 1.05, color: COLORS.textPrimary },
      card.title,
    ),
    div(
      { fontSize: isHome ? 30 : 38, lineHeight: 1.35, color: COLORS.textSecondary, maxWidth: 980 },
      card.description,
    ),
  ]);

  const footer = div({ display: "flex", flexDirection: "column", gap: 24 }, [
    ...(isHome ? [chipList(card.chips)] : []),
    div({ display: "flex", alignItems: "center", gap: 20 }, [
      div({
        width: 120,
        height: 6,
        borderRadius: 9999,
        backgroundImage: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accentBlue})`,
      }),
      div({ fontSize: 24, color: COLORS.textMuted }, card.footer),
    ]),
  ]);

  return div(
    {
      width: OG_IMAGE_SIZE.width,
      height: OG_IMAGE_SIZE.height,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      boxSizing: "border-box",
      padding: "64px 72px",
      backgroundColor: COLORS.background,
      backgroundImage:
        "radial-gradient(circle at 88% 8%, rgba(34,211,238,0.22), transparent 45%), radial-gradient(circle at 0% 100%, rgba(217,70,239,0.14), transparent 50%)",
      fontFamily: "Space Grotesk",
      color: COLORS.textPrimary,
    },
    [brandRow(), body, footer],
  );
}
