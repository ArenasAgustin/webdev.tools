/**
 * Localizable invalid-JSON messages with a real line and column.
 *
 * `JSON.parse` errors are English, differ between engines, and sometimes carry no
 * position at all (V8: `Unexpected token ']', "[1,]" is not valid JSON`). Instead of
 * parsing that text, the input is re-scanned to find where it stops being JSON.
 *
 * The scanner is iterative (an explicit container stack), so deeply nested input
 * cannot overflow the call stack. This module runs inside workers: it must stay free
 * of i18next imports.
 */

import { serviceMessage } from "@/services/serviceMessage";

export interface JsonSyntaxError {
  /** `services.syntax.atPosition` message wrapping the localized reason. */
  message: string;
  line: number;
  column: number;
}

interface Failure {
  offset: number;
  reason: string;
}

type Expect = "value" | "valueOrClose" | "key" | "keyOrClose" | "colon" | "commaOrClose" | "end";

const NUMBER = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
const LITERALS = ["true", "false", "null"];
const ESCAPES = new Set(['"', "\\", "/", "b", "f", "n", "r", "t"]);
const HEX4 = /^[0-9a-fA-F]{4}$/;

function unexpected(input: string, offset: number): Failure {
  if (offset >= input.length) {
    return { offset, reason: serviceMessage("services.json.unexpectedEnd") };
  }
  // Report a whole code point, so an emoji is not shown as half a surrogate pair.
  const char = String.fromCodePoint(input.codePointAt(offset) ?? 0);
  return { offset, reason: serviceMessage("services.json.unexpectedChar", { char }) };
}

/** Scan a string starting at the opening quote; returns the offset after it or a failure. */
function scanString(input: string, start: number): number | Failure {
  let i = start + 1;
  while (i < input.length) {
    const ch = input[i];
    if (ch === '"') return i + 1;
    if (ch === "\\") {
      const next = input[i + 1];
      if (next === "u") {
        if (!HEX4.test(input.slice(i + 2, i + 6))) {
          return { offset: i, reason: serviceMessage("services.json.invalidEscape") };
        }
        i += 6;
        continue;
      }
      if (next === undefined || !ESCAPES.has(next)) {
        return { offset: i, reason: serviceMessage("services.json.invalidEscape") };
      }
      i += 2;
      continue;
    }
    if (ch < " ") {
      return { offset: i, reason: serviceMessage("services.json.controlChar") };
    }
    i++;
  }
  return { offset: input.length, reason: serviceMessage("services.json.unterminatedString") };
}

/** Offset and reason of the first syntax error, or null when the input is valid JSON. */
function findFailure(input: string): Failure | null {
  const stack: string[] = [];
  let expect: Expect = "value";
  let i = 0;
  const afterValue = (): Expect => (stack.length ? "commaOrClose" : "end");

  while (true) {
    while (i < input.length && " \t\n\r".includes(input[i])) i++;
    if (i >= input.length) {
      return expect === "end" ? null : unexpected(input, i);
    }
    const ch = input[i];

    if (expect === "end") return unexpected(input, i);

    if (expect === "colon") {
      if (ch !== ":") return unexpected(input, i);
      i++;
      expect = "value";
      continue;
    }

    if (expect === "commaOrClose") {
      const top = stack[stack.length - 1];
      if (ch === ",") {
        i++;
        expect = top === "{" ? "key" : "value";
        continue;
      }
      if (ch === (top === "{" ? "}" : "]")) {
        stack.pop();
        i++;
        expect = afterValue();
        continue;
      }
      return unexpected(input, i);
    }

    if (expect === "key" || expect === "keyOrClose") {
      if (expect === "keyOrClose" && ch === "}") {
        stack.pop();
        i++;
        expect = afterValue();
        continue;
      }
      if (ch !== '"') return unexpected(input, i);
      const end = scanString(input, i);
      if (typeof end !== "number") return end;
      i = end;
      expect = "colon";
      continue;
    }

    // expect === "value" | "valueOrClose"
    if (expect === "valueOrClose" && ch === "]") {
      stack.pop();
      i++;
      expect = afterValue();
      continue;
    }
    if (ch === "{" || ch === "[") {
      stack.push(ch);
      i++;
      expect = ch === "{" ? "keyOrClose" : "valueOrClose";
      continue;
    }
    if (ch === '"') {
      const end = scanString(input, i);
      if (typeof end !== "number") return end;
      i = end;
      expect = afterValue();
      continue;
    }
    const literal = LITERALS.find((word) => input.startsWith(word, i));
    if (literal) {
      i += literal.length;
      expect = afterValue();
      continue;
    }
    NUMBER.lastIndex = i;
    const number = NUMBER.exec(input);
    if (number) {
      i += number[0].length;
      expect = afterValue();
      continue;
    }
    return unexpected(input, i);
  }
}

/** 1-based line and column of a character offset. */
function toLineColumn(input: string, offset: number): { line: number; column: number } {
  const before = input.slice(0, offset);
  const lines = before.split("\n");
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

/**
 * Describe why `input` is not valid JSON. Only call it after `JSON.parse` failed;
 * should the scanner disagree and accept the input, a generic message is returned.
 */
export function describeJsonSyntaxError(input: string): JsonSyntaxError {
  const failure = findFailure(input) ?? {
    offset: 0,
    reason: serviceMessage("services.json.invalid"),
  };
  const { line, column } = toLineColumn(input, failure.offset);
  return {
    message: serviceMessage("services.syntax.atPosition", {
      message: failure.reason,
      line,
      column,
      frame: "",
    }),
    line,
    column,
  };
}
