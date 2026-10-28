// @vitest-environment node
import { describe, expect, it } from "vitest";
import { formatHtml, minifyHtml, cleanHtml } from "./transform";
import { serviceMessage } from "@/services/serviceMessage";

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
  const minifyOptions = {
    removeComments: true,
    collapseWhitespace: true,
    minifyCss: true,
    minifyJs: true,
  };

  it.each([
    ["a closing tag with no open element", "<div>a</div></span>", /unexpectedClosingTag/],
    ["misnested tags", "<div><span>a</div></span>", /misnestedClosingTag/],
    ["an unclosed comment", "<div>a</div><!-- open", /unclosedComment/],
    ["an unterminated tag", '<div class="a">x</div><img src="b', /unclosedTag/],
  ])("rejects HTML with %s instead of minifying it", async (_name, input, pattern) => {
    const result = await minifyHtml(input, minifyOptions);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(pattern);
  });

  it("reports the tag and line of a stray closing tag", async () => {
    const result = await minifyHtml("<div>\n</section>\n</div>", minifyOptions);

    expect(result).toEqual({
      ok: false,
      error: serviceMessage("services.html.unexpectedClosingTag", { tag: "section", line: 2 }),
    });
  });

  it("accepts valid HTML with optional end tags, void elements and raw text", async () => {
    const input = [
      "<!DOCTYPE html><html><head><title>a</div></title>",
      '<script>if (a < b) document.write("</p></span>")</script></head>',
      "<body><p>one<p>two<ul><li>a<li>b</ul>",
      '<table><tr><td>1<td>2</table><br><img src="x"><svg><path d="M0 0" /></svg>',
      '<input value="a>b"></br></p><textarea></div></textarea>',
      "<a title=it's href=/x>link</a><?php echo 1; ?>",
      "<!-- ok --></body></html>",
    ].join("\n");
    const result = await minifyHtml(input, minifyOptions);

    expect(result.ok).toBe(true);
  });

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

  it("keeps a single space between inline elements and around inline text", async () => {
    const input =
      "<p>\n  Hello\n  <b>bold</b>   <i>italic</i>\n  world <a href='#'>link</a>.\n</p>";

    const result = await minifyHtml(input, {
      removeComments: false,
      collapseWhitespace: true,
      minifyCss: false,
      minifyJs: false,
    });

    expect(result).toEqual({
      ok: true,
      value: "<p>Hello <b>bold</b> <i>italic</i> world <a href='#'>link</a>.</p>",
    });
  });

  it("keeps whitespace inside pre and textarea verbatim", async () => {
    const input =
      "<div>\n  <pre>  line 1\n    line 2</pre>\n  <textarea>a\n\n  b</textarea>\n</div>";

    const result = await minifyHtml(input, {
      removeComments: false,
      collapseWhitespace: true,
      minifyCss: false,
      minifyJs: false,
    });

    expect(result).toEqual({
      ok: true,
      value: "<div><pre>  line 1\n    line 2</pre><textarea>a\n\n  b</textarea></div>",
    });
  });

  it("returns error for invalid HTML that throws during minification", async () => {
    // Trigger the catch path by passing a non-string
    const result = await minifyHtml(null as unknown as string, {
      removeComments: true,
      collapseWhitespace: true,
      minifyCss: false,
      minifyJs: false,
    });
    expect(result.ok).toBe(false);
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

describe("cleanHtml", () => {
  it("returns error for empty input", () => {
    const result = cleanHtml("   ");
    expect(result.ok).toBe(false);
    // Worker-safe transforms return a message key; services localize it.
    if (!result.ok) expect(result.error).toBe("services.html.empty");
  });

  it("removes empty tags by default", () => {
    const result = cleanHtml("<div></div><p>hello</p>");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).not.toContain("<div></div>");
      expect(result.value).toContain("<p>hello</p>");
    }
  });

  it("keeps empty tags when removeEmptyTags is false", () => {
    const result = cleanHtml("<div></div><p>hello</p>", { removeEmptyTags: false });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toContain("<div></div>");
  });

  it("removes self-closing non-void tags", () => {
    const result = cleanHtml("<section /><p>content</p>");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).not.toContain("<section />");
      expect(result.value).toContain("<p>content</p>");
    }
  });

  it("preserves void self-closing tags (br, img, input, meta)", () => {
    const result = cleanHtml("<br /><img src='x.png' /><input type='text' />");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("<br");
      expect(result.value).toContain("<img");
      expect(result.value).toContain("<input");
    }
  });

  it("preserves script and style blocks even if they appear empty", () => {
    const result = cleanHtml("<style></style><script></script><div></div>");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("<style></style>");
      expect(result.value).toContain("<script></script>");
    }
  });

  it("preserves valid content", () => {
    const result = cleanHtml("<div><h1>Title</h1><p>Text</p></div>");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("<h1>Title</h1>");
      expect(result.value).toContain("<p>Text</p>");
    }
  });

  it("removes multiple consecutive empty tags", () => {
    const result = cleanHtml("<span></span><em></em><strong>ok</strong>");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).not.toContain("<span></span>");
      expect(result.value).not.toContain("<em></em>");
      expect(result.value).toContain("<strong>ok</strong>");
    }
  });
});

describe("preserved content with replacement patterns", () => {
  const dollarScript = '<script>var a = "$$"; var b = "$\'"; var c = s.replace(/x/, "$&!");</script>';

  it("formatHtml keeps $ patterns in scripts when JS formatting is off", async () => {
    const result = await formatHtml(`<div>${dollarScript}</div>`, 2, { formatJs: false });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain('var a = "$$"; var b = "$\'"; var c = s.replace(/x/, "$&!");');
    }
  });

  it("minifyHtml keeps $ patterns in pre and unminified scripts", async () => {
    const result = await minifyHtml(`<pre>cost: $$5 and $&</pre>\n${dollarScript}`, {
      removeComments: true,
      collapseWhitespace: true,
      minifyCss: true,
      minifyJs: false,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("<pre>cost: $$5 and $&</pre>");
      expect(result.value).toContain(dollarScript);
    }
  });

  it("cleanHtml keeps $ patterns in preserved blocks", () => {
    const result = cleanHtml(`<p></p>${dollarScript}<span></span>`);

    expect(result).toEqual({ ok: true, value: dollarScript });
  });
});
