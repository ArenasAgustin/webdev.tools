import { describe, expect, it } from "vitest";
import { formatHtml, minifyHtml } from "./transform";

describe("formatHtml", () => {
  it("returns empty output for blank input", async () => {
    const result = await formatHtml("   \n  ");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("");
    }
  });

  it("formats HTML using prettier", async () => {
    const input = "<div   class='x'  id='y'><span>hola</span></div>";
    const result = await formatHtml(input, 2);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain('<div class="x" id="y">');
      expect(result.value).toContain("<span>hola</span>");
    }
  });
});

describe("minifyHtml", () => {
  it("returns empty output for blank input", () => {
    const result = minifyHtml("\n\t  ", {
      removeComments: true,
      collapseWhitespace: true,
      minifyCss: true,
      minifyJs: true,
    });

    expect(result).toEqual({ ok: true, value: "" });
  });

  it("removes non-conditional comments", () => {
    const input = "<div><!-- remove --><span>ok</span><!--[if IE]>keep<![endif]--></div>";
    const result = minifyHtml(input, {
      removeComments: true,
      collapseWhitespace: false,
      minifyCss: false,
      minifyJs: false,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).not.toContain("remove");
      expect(result.value).toContain("<!--[if IE]>keep<![endif]-->");
    }
  });

  it("minifies inline css and javascript", () => {
    const input = `
      <style>
        /* comment */
        .box { color: red; margin: 0px; }
      </style>
      <script>
        // inline comment
        const value = 1 + 2;
      </script>
    `;

    const result = minifyHtml(input, {
      removeComments: true,
      collapseWhitespace: false,
      minifyCss: true,
      minifyJs: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("<style>.box{color:red;margin:0px}</style>");
      expect(result.value).toContain("<script>const value=3;</script>");
    }
  });

  it("does not modify external script tags", () => {
    const input = '<script src="/app.js"></script>';
    const result = minifyHtml(input, {
      removeComments: true,
      collapseWhitespace: true,
      minifyCss: true,
      minifyJs: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('<script src="/app.js"></script>');
    }
  });

  it("collapses whitespace between tags", () => {
    const input = `<main>
      <h1>Title</h1>
      <p>Text</p>
    </main>`;

    const result = minifyHtml(input, {
      removeComments: false,
      collapseWhitespace: true,
      minifyCss: false,
      minifyJs: false,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("<main><h1>Title</h1><p>Text</p></main>");
    }
  });
});
