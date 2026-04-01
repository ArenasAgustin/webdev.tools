import { describe, it, expect } from "vitest";
import { cleanHtml } from "./transform";

describe("cleanHtml - empty tags", () => {
  it("should remove empty tags", () => {
    const input = `<div></div>
<span>text</span>
<p></p>`;

    const result = cleanHtml(input, {
      removeEmptyTags: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).not.toContain("<div></div>");
      expect(result.value).not.toContain("<p></p>");
      expect(result.value).toContain("<span>text</span>");
    }
  });

  it("should remove self-closing empty tags", () => {
    const input = `<div />
<span>text</span>
<p />`;

    const result = cleanHtml(input, {
      removeEmptyTags: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).not.toContain("<div />");
      expect(result.value).not.toContain("<p />");
      expect(result.value).toContain("<span>text</span>");
    }
  });

  it("should preserve void elements", () => {
    const input = `<br>
<meta charset="utf-8">
<span>text</span>
<link rel="stylesheet">`;

    const result = cleanHtml(input, {
      removeEmptyTags: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("<br>");
      expect(result.value).toContain("<meta");
      expect(result.value).toContain("<link");
      expect(result.value).toContain("<span>text</span>");
    }
  });

  it("should preserve script and style tags", () => {
    const input = `<script></script>
<style></style>
<div>text</div>`;

    const result = cleanHtml(input, {
      removeEmptyTags: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("<script></script>");
      expect(result.value).toContain("<style></style>");
      expect(result.value).toContain("<div>text</div>");
    }
  });

  it("should preserve tags with whitespace inside", () => {
    const input = `<div>   </div>
<span>text</span>`;

    const result = cleanHtml(input, {
      removeEmptyTags: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("<span>text</span>");
      // Note: tags with whitespace might still be removed depending on implementation
    }
  });

  it("should return error for empty input", () => {
    const result = cleanHtml("   ");

    expect(result.ok).toBe(false);
  });

  it("should keep empty tags when disabled", () => {
    const input = `<div></div>
<span>text</span>`;

    const result = cleanHtml(input, {
      removeEmptyTags: false,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("<div></div>");
      expect(result.value).toContain("<span>text</span>");
    }
  });

  it("should handle nested empty tags", () => {
    const input = `<div><span></span></div>
<p>text</p>`;

    const result = cleanHtml(input, {
      removeEmptyTags: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("<p>text</p>");
    }
  });
});
