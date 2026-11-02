import { describe, expect, it } from "vitest";
import { getHomeMeta } from "@/utils/routeMeta";

const fs = process.getBuiltinModule("node:fs");
const html = fs.readFileSync(`${process.cwd()}/index.html`, "utf8");
const doc = new DOMParser().parseFromString(html, "text/html");

const content = (selector: string) => doc.querySelector(selector)?.getAttribute("content");

/** Values are irrelevant here; only the image URL is asserted. */
const homeImage = getHomeMeta((key) => key).ogImage;

describe("index.html social preview image", () => {
  it("points og:image at the build-generated home image", () => {
    expect(content('meta[property="og:image"]')).toBe(homeImage);
  });

  it("reuses the same image for twitter:image", () => {
    expect(content('meta[name="twitter:image"]')).toBe(homeImage);
  });

  it("references no image that the build does not produce", () => {
    expect(html).not.toMatch(/og-image\.png|twitter-image\.png/);
  });
});
