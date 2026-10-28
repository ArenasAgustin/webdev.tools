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

/** Max significant decimal digits that always survive a double round-trip unchanged. */
const MAX_SIGNIFICANT_DIGITS = 17;

const NUMBER_PATTERN = /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y;

function significantDigits(token: string): string {
  const mantissa = token.replace(/^-/, "").replace(/[eE].*$/, "").replace(".", "");
  return mantissa.replace(/^0+/, "").replace(/0+$/, "");
}

function losesPrecision(token: string): boolean {
  const value = Number(token);
  if (!Number.isFinite(value)) return true;

  const isPlainInteger = /^-?\d+$/.test(token);
  if (isPlainInteger) {
    if (Number.isSafeInteger(value)) return false;
    return BigInt(token) !== BigInt(value);
  }

  const digits = significantDigits(token);
  // Underflow: a non-zero literal that became 0
  if (value === 0) return digits.length > 0;
  return digits.length > MAX_SIGNIFICANT_DIGITS;
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
