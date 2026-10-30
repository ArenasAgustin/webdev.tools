/**
 * Detects input that JSON.parse/JSON.stringify silently change.
 * Pure function - no side effects. Assumes `input` is valid JSON (call it after a
 * successful parse); on malformed input the answer is best effort.
 *
 * This is a lightweight scan, not a lossless parser: it only tells the UI whether
 * to warn that numbers lost precision or duplicate keys were collapsed.
 */
export interface JsonLossReport {
  /** A number can't be represented exactly as a double (big integers, 1e400, …). */
  precisionLoss: boolean;
  /** An object repeats a key; JSON.parse keeps only the last value. */
  duplicateKeys: boolean;
}

const NUMBER_PATTERN = /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y;

/**
 * The decimal value a number literal names, independent of how it is written:
 * sign, significant digits and the position of the decimal point
 * ("1e3", "1000" and "1000.0" all give "1e4"; zero gives "0").
 */
function canonicalDecimal(literal: string): string {
  const [mantissa, exponent = "0"] = literal.toLowerCase().split("e");
  const negative = mantissa.startsWith("-");
  const [integer, fraction = ""] = mantissa.replace("-", "").split(".");
  let digits = integer + fraction;
  let point = integer.length + Number(exponent);
  const leadingZeros = /^0*/.exec(digits)?.[0].length ?? 0;
  digits = digits.slice(leadingZeros).replace(/0+$/, "");
  point -= leadingZeros;
  if (!digits) return "0";
  return `${negative ? "-" : ""}${digits}e${point}`;
}

/**
 * True when JSON.parse + JSON.stringify would not write back the same value:
 * overflow to Infinity, underflow to 0, more digits than a double keeps
 * (big integers, most 17+ digit decimals), or -0 (written as 0).
 */
function losesPrecision(token: string): boolean {
  const value = Number(token);
  if (!Number.isFinite(value) || Object.is(value, -0)) return true;
  // String(value) is the shortest literal that reads back as this double,
  // the same digits JSON.stringify writes.
  return canonicalDecimal(token) !== canonicalDecimal(String(value));
}

interface Frame {
  isObject: boolean;
  expectKey: boolean;
  keys: Set<string>;
}

export function detectJsonLoss(input: string): JsonLossReport {
  const report: JsonLossReport = { precisionLoss: false, duplicateKeys: false };
  // Explicit stack (no recursion) so deeply nested input can't overflow the call stack
  const stack: Frame[] = [];
  let i = 0;

  while (i < input.length && !(report.precisionLoss && report.duplicateKeys)) {
    const char = input[i];
    const top = stack[stack.length - 1] as Frame | undefined;

    if (char === '"') {
      let end = i + 1;
      while (end < input.length && input[end] !== '"') {
        end += input[end] === "\\" ? 2 : 1;
      }
      if (top?.isObject && top.expectKey) {
        let key: string;
        try {
          key = JSON.parse(input.slice(i, end + 1)) as string;
        } catch {
          key = input.slice(i + 1, end);
        }
        if (top.keys.has(key)) report.duplicateKeys = true;
        top.keys.add(key);
        top.expectKey = false;
      }
      i = end + 1;
      continue;
    }

    if (char === "-" || (char >= "0" && char <= "9")) {
      NUMBER_PATTERN.lastIndex = i;
      const match = NUMBER_PATTERN.exec(input);
      if (match) {
        if (losesPrecision(match[0])) report.precisionLoss = true;
        i += match[0].length;
        continue;
      }
    }

    if (char === "{") stack.push({ isObject: true, expectKey: true, keys: new Set() });
    else if (char === "[") stack.push({ isObject: false, expectKey: false, keys: new Set() });
    else if (char === "}" || char === "]") stack.pop();
    else if (char === "," && top?.isObject) top.expectKey = true;

    i += 1;
  }

  return report;
}
