#!/usr/bin/env node

/**
 * Prerenders one static HTML shell per playground after `vite build`, so crawlers
 * that don't run JS (WhatsApp, X, LinkedIn, Slack) see route-specific meta:
 * writes dist/playground/<id>/index.html from dist/index.html with the same
 * title, description, canonical, Open Graph, Twitter and JSON-LD values the
 * runtime useDocumentMeta hook sets. The SPA still boots normally from it.
 *
 * Usage: node scripts/prerender.mjs
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DIST, loadSiteData } from "./lib/site-data.mjs";

const { seo, t, playgrounds } = await loadSiteData();
const shell = await readFile(path.join(DIST, "index.html"), "utf8");

for (const playground of playgrounds) {
  const html = seo.renderRouteHead(shell, seo.getPlaygroundMeta(playground, t));
  const outDir = path.join(DIST, "playground", playground.id);
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "index.html"), html);
}

console.log(`prerender: wrote ${playgrounds.length} routes to dist/playground`);
