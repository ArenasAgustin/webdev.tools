import { describe, expect, it } from "vitest";
import { buildOgImageTree, getOgCards, OG_IMAGE_SIZE, type OgNode } from "./ogImage";
import type { TranslateFn } from "./routeMeta";

const t: TranslateFn = (key) => `<${key}>`;

const playgrounds = [
  { id: "json", name: "JSON Tools", description: "Formatear, minificar y filtrar JSON" },
  { id: "css", name: "CSS Tools", description: "Formatear y minificar CSS" },
];

/** All text nodes of a tree, in document order. */
function texts(node: OgNode | string): string[] {
  if (typeof node === "string") return [node];
  const { children } = node.props;
  if (children === undefined) return [];
  return (Array.isArray(children) ? children : [children]).flatMap(texts);
}

/** Satori rejects a div with more than one child unless it is display:flex. */
function nonFlexParents(node: OgNode | string): OgNode[] {
  if (typeof node === "string") return [];
  const { children, style } = node.props;
  const list = children === undefined ? [] : Array.isArray(children) ? children : [children];
  const self = list.length > 1 && style?.display !== "flex" ? [node] : [];
  return [...self, ...list.flatMap(nonFlexParents)];
}

describe("OG_IMAGE_SIZE", () => {
  it("is the 1200x630 Open Graph size", () => {
    expect(OG_IMAGE_SIZE).toEqual({ width: 1200, height: 630 });
  });
});

describe("getOgCards", () => {
  it("returns the home card first and one card per playground", () => {
    expect(getOgCards(playgrounds, t).map((card) => card.slug)).toEqual(["home", "json", "css"]);
  });

  it("lists every playground name on the home card", () => {
    const [home] = getOgCards(playgrounds, t);

    expect(home).toMatchObject({
      eyebrow: "<home.tagline>",
      title: "webdev.tools",
      description: "<home.headline>",
      chips: ["JSON Tools", "CSS Tools"],
      footer: "arenas-webtools.vercel.app",
    });
  });

  it("uses the playground name, description and route on its card", () => {
    const json = getOgCards(playgrounds, t)[1];

    expect(json).toEqual({
      slug: "json",
      eyebrow: "<page.playground>",
      title: "JSON Tools",
      description: "Formatear, minificar y filtrar JSON",
      chips: [],
      footer: "arenas-webtools.vercel.app/playground/json",
    });
  });
});

describe("buildOgImageTree", () => {
  const cards = getOgCards(playgrounds, t);

  it.each(cards)("renders the brand, title and description of $slug", (card) => {
    const content = texts(buildOgImageTree(card));

    expect(content).toEqual(expect.arrayContaining(["webdev.tools", card.title, card.description]));
    expect(content).toContain(card.footer);
  });

  it("renders the home chips", () => {
    expect(texts(buildOgImageTree(cards[0]))).toEqual(
      expect.arrayContaining(["JSON Tools", "CSS Tools"]),
    );
  });

  it.each(cards)("uses display:flex on every multi-child node of $slug", (card) => {
    expect(nonFlexParents(buildOgImageTree(card))).toEqual([]);
  });

  it("fills the whole canvas with the dark brand background", () => {
    const root = buildOgImageTree(cards[1]);

    expect(root.props.style).toMatchObject({
      width: 1200,
      height: 630,
      backgroundColor: "#020617",
    });
  });
});
