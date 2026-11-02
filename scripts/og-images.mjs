#!/usr/bin/env node

/**
 * Renders the Open Graph images (1200x630 PNG) into dist/og/<slug>.png after `vite build`:
 * one for the home page and one per playground. Pure Node (satori + resvg), no browser.
 *
 * Usage: node scripts/og-images.mjs
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { DIST, ROOT, loadSiteData } from "./lib/site-data.mjs";

const FONT_WEIGHTS = [400, 500, 700];

async function loadFonts() {
  return Promise.all(
    FONT_WEIGHTS.map(async (weight) => ({
      name: "Space Grotesk",
      weight,
      style: "normal",
      data: await readFile(
        path.join(
          ROOT,
          `node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-${weight}-normal.woff`,
        ),
      ),
    })),
  );
}

const { seo, t, playgrounds } = await loadSiteData();
const fonts = await loadFonts();
const outDir = path.join(DIST, "og");
await mkdir(outDir, { recursive: true });

for (const card of seo.getOgCards(playgrounds, t)) {
  const svg = await satori(seo.buildOgImageTree(card), { ...seo.OG_IMAGE_SIZE, fonts });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: seo.OG_IMAGE_SIZE.width } })
    .render()
    .asPng();
  await writeFile(path.join(outDir, `${card.slug}.png`), png);
}

console.log(`og-images: wrote ${playgrounds.length + 1} images to dist/og`);
