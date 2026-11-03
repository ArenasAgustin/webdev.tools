import { describe, it, expect } from "vitest";
import { parseJson, formatJson, minifyJson, cleanJson } from "@/services/json/transform";
import { applyJsonPath } from "@/services/json/jsonPath";
import { localizeServiceMessage } from "@/services/localizeServiceMessage";

// Tests run with the Spanish locale (src/test/setup.ts).
describe("invalid JSON messages", () => {
  it("parseJson reports the real line and column, not the character offset", () => {
    const result = parseJson('{\n  "a": 1\n  "b": 2\n}');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.line).toBe(3);
    expect(result.error.column).toBe(3);
    expect(localizeServiceMessage(result.error.message)).toBe(
      "“\"” inesperado (línea 3, columna 3)",
    );
  });

  it("localizes errors the engine words without a position", () => {
    const result = parseJson("[1,]");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.line).toBe(1);
    expect(result.error.column).toBe(4);
    expect(localizeServiceMessage(result.error.message)).toBe("“]” inesperado (línea 1, columna 4)");
  });

  it("localizes a truncated document and an unterminated string", () => {
    const truncated = parseJson('{"a": [1, 2');
    expect(!truncated.ok && localizeServiceMessage(truncated.error.message)).toBe(
      "El JSON termina antes de tiempo (línea 1, columna 12)",
    );
    const unterminated = parseJson('{"a": "x');
    expect(!unterminated.ok && localizeServiceMessage(unterminated.error.message)).toBe(
      "Cadena sin cerrar: falta la comilla de cierre (línea 1, columna 9)",
    );
  });

  it("Format, Minify, Clean and JSONPath share the localized message", async () => {
    const input = "{a:1}";
    const expected = "“a” inesperado (línea 1, columna 2)";

    const formatted = await formatJson(input);
    expect(!formatted.ok && localizeServiceMessage(formatted.error)).toBe(expected);
    const minified = minifyJson(input);
    expect(!minified.ok && localizeServiceMessage(minified.error)).toBe(expected);
    const cleaned = cleanJson(input);
    expect(!cleaned.ok && localizeServiceMessage(cleaned.error.message)).toBe(expected);
    const filtered = applyJsonPath(input, "$.a");
    expect(!filtered.ok && localizeServiceMessage(filtered.error.message)).toBe(expected);
  });
});
