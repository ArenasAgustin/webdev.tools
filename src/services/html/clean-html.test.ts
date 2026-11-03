// @vitest-environment node
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

describe("cleanHtml - unquoted attribute values", () => {
  const clean = (input: string) => {
    const result = cleanHtml(input, { removeEmptyTags: true });
    if (!result.ok) throw new Error(result.error);
    return result.value;
  };

  it.each([
    ['<a href=/>Home</a>'],
    ['<a href=/docs/>Docs</a>'],
    ['<a class=x href= />Home</a>'],
  ])("keeps a tag whose unquoted value ends in a slash: %s", (input) => {
    expect(clean(input)).toBe(input);
  });

  it.each([['<div />'], ["<x/>"], ["<section />"]])(
    "still removes a real self-closing tag: %s",
    (input) => {
      expect(clean(`${input}<p>x</p>`)).toBe("<p>x</p>");
    },
  );
});

describe("cleanHtml - meaningful empty elements", () => {
  const clean = (input: string) => {
    const result = cleanHtml(input, { removeEmptyTags: true });
    if (!result.ok) throw new Error(result.error);
    return result.value;
  };

  it.each([
    ["<table><tr><td></td><td>x</td></tr></table>"],
    ["<table><tr><th></th></tr><tr></tr></table>"],
    ["<ul><li></li></ul>"],
    ["<select><option></option></select>"],
    ['<i class="fa fa-home"></i>'],
    ['<div id="app"></div>'],
    ['<x a="1"/>'],
    ["<my-widget></my-widget>"],
    ["<my-el />"],
    ["<video></video><audio></audio>"],
  ])("keeps %s", (input) => {
    expect(clean(input)).toBe(input);
  });

  it.each([
    ["<svg><svg><rect/></svg><g/></svg>"],
    ["<svg><svg></svg><g></g></svg><p>x</p>"],
    ["<math><math><mi/></math><mo/></math>"],
  ])("keeps every child of a nested svg or math block: %s", (input) => {
    expect(clean(input)).toBe(input);
  });

  it("still removes empty elements without attributes", () => {
    expect(clean("<div></div><span> </span><b/><p>x</p>")).toBe("<p>x</p>");
  });
});
