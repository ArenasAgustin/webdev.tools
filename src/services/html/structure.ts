/**
 * Conservative structural check for HTML.
 *
 * Browsers recover from almost any markup, so "invalid" here only means damage a
 * minifier would silently carry over: a closing tag that matches no open element,
 * a closing tag that crosses an element whose end tag is required (`<b><i></b>`),
 * and a comment or tag left open at the end of the input. Unclosed elements at the
 * end, optional end tags (`<p>`, `<li>`, table parts...), void elements and raw
 * text (`<script>`, `<style>`, `<textarea>`, `<title>`) are accepted.
 *
 * Returns a `services.html.*` message (see `serviceMessage`) or `null`.
 */

import { serviceMessage } from "@/services/serviceMessage";

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
  "keygen",
  "frame",
]);

// Elements whose end tag may be omitted: closing an ancestor implicitly closes them.
const OPTIONAL_END_TAG = new Set([
  "html",
  "head",
  "body",
  "p",
  "li",
  "dt",
  "dd",
  "rb",
  "rt",
  "rtc",
  "rp",
  "optgroup",
  "option",
  "colgroup",
  "caption",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "td",
  "th",
]);

// Elements whose content is text up to their own closing tag.
const RAW_TEXT_ELEMENTS = new Set([
  "script",
  "style",
  "textarea",
  "title",
  "xmp",
  "iframe",
  "noembed",
  "noframes",
]);

// Stray end tags browsers turn into elements (`</br>` -> `<br>`, `</p>` -> `<p></p>`).
const TOLERATED_STRAY_END_TAGS = new Set(["br", "p"]);

const TAG_NAME = /^[A-Za-z][^\s/>]*/;

export function findHtmlStructureError(source: string): string | null {
  const open: string[] = [];
  let i = 0;

  const lineAt = (index: number) => source.slice(0, index).split("\n").length;

  while (i < source.length) {
    const lt = source.indexOf("<", i);
    if (lt === -1) break;
    i = lt;

    if (source.startsWith("<!--", i)) {
      const close = source.indexOf("-->", i + 4);
      if (close === -1) return serviceMessage("services.html.unclosedComment", { line: lineAt(i) });
      i = close + 3;
      continue;
    }

    // Doctype, CDATA, processing instructions (`<?php ... ?>`, `<?xml ... ?>`).
    if (source[i + 1] === "!" || source[i + 1] === "?") {
      const close = source.indexOf(">", i + 2);
      if (close === -1) return serviceMessage("services.html.unclosedTag", { line: lineAt(i) });
      i = close + 1;
      continue;
    }

    const isEnd = source[i + 1] === "/";
    const nameMatch = TAG_NAME.exec(source.slice(i + (isEnd ? 2 : 1)));
    if (!nameMatch) {
      // A bare "<" in text (e.g. "a < b") is not a tag.
      i += 1;
      continue;
    }

    const name = nameMatch[0].toLowerCase();
    const tagEnd = findTagEnd(source, i + (isEnd ? 2 : 1) + nameMatch[0].length);
    if (tagEnd === -1) return serviceMessage("services.html.unclosedTag", { line: lineAt(i) });

    if (isEnd) {
      const index = open.lastIndexOf(name);
      if (index === -1) {
        if (!TOLERATED_STRAY_END_TAGS.has(name)) {
          return serviceMessage("services.html.unexpectedClosingTag", {
            tag: name,
            line: lineAt(i),
          });
        }
      } else {
        const crossed = open.slice(index + 1).find((element) => !OPTIONAL_END_TAG.has(element));
        if (crossed) {
          return serviceMessage("services.html.misnestedClosingTag", {
            tag: name,
            open: crossed,
            line: lineAt(i),
          });
        }
        open.length = index;
      }
      i = tagEnd + 1;
      continue;
    }

    i = tagEnd + 1;
    const selfClosing = source[tagEnd - 1] === "/";
    if (VOID_ELEMENTS.has(name) || selfClosing) continue;

    if (RAW_TEXT_ELEMENTS.has(name)) {
      const closeTag = new RegExp(`</${name}[\\s/>]`, "i").exec(source.slice(i));
      // An unclosed raw text element swallows the rest of the document, as in browsers.
      i = closeTag ? i + closeTag.index : source.length;
      open.push(name);
      continue;
    }

    open.push(name);
  }

  return null;
}

/** Index of the `>` that ends a tag whose attributes start at `from`, or -1. */
function findTagEnd(source: string, from: number): number {
  let i = from;
  let afterEquals = false;
  while (i < source.length) {
    const char = source[i];
    if (char === ">") return i;
    if (char === "=") {
      afterEquals = true;
      i += 1;
      continue;
    }
    if (/\s/.test(char)) {
      i += 1;
      continue;
    }
    // Only a quote that opens an attribute value delimits it (`title=it's` is unquoted).
    const opensValue = afterEquals && (char === '"' || char === "'");
    afterEquals = false;
    if (opensValue) {
      const close = source.indexOf(char, i + 1);
      if (close === -1) return -1;
      i = close + 1;
      continue;
    }
    i += 1;
  }
  return -1;
}
