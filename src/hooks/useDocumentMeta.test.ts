import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDocumentMeta, type DocumentMetaOptions } from "./useDocumentMeta";

const robots = () => document.querySelector('meta[name="robots"]')?.getAttribute("content");
const canonical = () => document.querySelector('link[rel="canonical"]')?.getAttribute("href");

describe("useDocumentMeta robots and canonical", () => {
  beforeEach(() => {
    // The static index.html head that every route (including unknown ones) starts from.
    document.head.innerHTML =
      '<meta name="robots" content="index, follow" />' +
      '<link rel="canonical" href="https://example.test/" />';
  });

  it("keeps a not-found page out of the index and drops the home canonical", () => {
    renderHook(() => useDocumentMeta({ title: "Not found", ogUrl: "https://example.test/", noindex: true }));

    expect(robots()).toBe("noindex");
    expect(canonical()).toBeUndefined();
  });

  it("restores indexing and the canonical when a real page follows", () => {
    const initialProps: DocumentMetaOptions = { title: "Not found", noindex: true };
    const { rerender } = renderHook((options: DocumentMetaOptions) => useDocumentMeta(options), {
      initialProps,
    });

    rerender({ title: "JSON", ogUrl: "https://example.test/playground/json" });

    expect(robots()).toBe("index, follow");
    expect(canonical()).toBe("https://example.test/playground/json");
  });
});
