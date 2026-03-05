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

  it("formats embedded CSS and JS within HTML", async () => {
    const input = `
      <html>
        <head>
          <style>body{color:red}.box{padding:0  ;margin:0}</style>
        </head>
        <body>
          <script>function test( ){console.log('x')}</script>
        </body>
      </html>
    `;

    const result = await formatHtml(input, 2);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("body {");
      expect(result.value).toContain("color: red;");
      expect(result.value).toContain(".box {");
      expect(result.value).toContain("function test() {");
      expect(result.value).toContain('console.log("x");');
    }
  });

  it("can skip formatting embedded JS while keeping CSS formatting", async () => {
    const input = `
      <html>
        <head><style>body{color:red}</style></head>
        <body><script>function test( ){console.log('x')}</script></body>
      </html>
    `;

    const result = await formatHtml(input, 2, { formatCss: true, formatJs: false });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("body {");
      expect(result.value).toContain("function test( ){console.log('x')}");
      expect(result.value).not.toContain('console.log("x");');
    }
  });

  it("can skip formatting embedded CSS while keeping JS formatting", async () => {
    const input = `
      <html>
        <head><style>body{color:red}</style></head>
        <body><script>function test( ){console.log('x')}</script></body>
      </html>
    `;

    const result = await formatHtml(input, 2, { formatCss: false, formatJs: true });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("body{color:red}");
      expect(result.value).not.toContain("body {");
      expect(result.value).toContain("function test() {");
      expect(result.value).toContain('console.log("x");');
    }
  });
});

describe("minifyHtml", () => {
  it("returns empty output for blank input", async () => {
    const result = await minifyHtml("\n\t  ", {
      removeComments: true,
      collapseWhitespace: true,
      minifyCss: true,
      minifyJs: true,
    });

    expect(result).toEqual({ ok: true, value: "" });
  });

  it("removes non-conditional comments", async () => {
    const input = "<div><!-- remove --><span>ok</span><!--[if IE]>keep<![endif]--></div>";
    const result = await minifyHtml(input, {
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

  it("minifies inline css and javascript", async () => {
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

    const result = await minifyHtml(input, {
      removeComments: true,
      collapseWhitespace: false,
      minifyCss: true,
      minifyJs: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("<style>.box{color:red;margin:0px}</style>");
      expect(result.value).toContain("<script>const value=3</script>");
    }
  });

  it("does not modify external script tags", async () => {
    const input = '<script src="/app.js"></script>';
    const result = await minifyHtml(input, {
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

  it("collapses whitespace between tags", async () => {
    const input = `<main>
      <h1>Title</h1>
      <p>Text</p>
    </main>`;

    const result = await minifyHtml(input, {
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

  it("preserves inline CSS and JS content when minifyCss/minifyJs are disabled", async () => {
    const input = `
      <style>
        .box {
          color:   red;
        }
      </style>
      <script>
        const  value = 1 + 2;
        console.log(value);
      </script>
      <div>  ok  </div>
    `;

    const result = await minifyHtml(input, {
      removeComments: false,
      collapseWhitespace: true,
      minifyCss: false,
      minifyJs: false,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("<style>.box {");
      expect(result.value).toContain("color:   red;");
      expect(result.value).toContain("const  value = 1 + 2;");
      expect(result.value).toContain("console.log(value);");
      expect(result.value).not.toContain("<style>.box{color:red}");
      expect(result.value).not.toContain("const value=3");
      expect(result.value).toContain("<div>ok</div>");
    }
  });
});
