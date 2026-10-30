import { describe, it, expect } from "vitest";
import { validateCss, minifyCss, formatCss } from "@/services/css/transform";
import { minifyJs, formatJs } from "@/services/js/transform";
import { formatHtml } from "@/services/html/transform";
import { localizeServiceMessage } from "@/services/localizeServiceMessage";
import { friendlySyntaxError } from "@/services/syntaxErrors";

function errorText(result: { ok: boolean; error?: unknown }): string {
  if (result.ok) throw new Error("expected an error");
  return localizeServiceMessage(String(result.error));
}

describe("library syntax errors are shown as localized messages", () => {
  it("CSS validate and minify explain an unclosed block with its position", async () => {
    expect(errorText(await validateCss("a { color: red"))).toBe(
      "Bloque sin cerrar: falta la “}” de una “{” (línea 1, columna 1)",
    );
    expect(errorText(await minifyCss("a { color: red"))).toBe(
      "CSS inválido: Bloque sin cerrar: falta la “}” de una “{” (línea 1, columna 1)",
    );
  });

  it("CSS format keeps the code frame under the localized message", async () => {
    expect(errorText(await formatCss('a { content: "x }'))).toBe(
      'Cadena sin cerrar: falta la comilla de cierre (línea 1, columna 14)\n> 1 | a { content: "x }\n    |              ^',
    );
  });

  it("JS minify names the unexpected token and where it is", () => {
    expect(errorText(minifyJs("const a = 1;\nfunction ( {"))).toBe("“(” inesperado (línea 2, columna 10)");
    expect(errorText(minifyJs("const a = ("))).toBe("El código termina antes de tiempo (línea 1, columna 12)");
  });

  it("JS format keeps the position and the code frame", async () => {
    expect(errorText(await formatJs("function ( {"))).toBe(
      "Símbolo inesperado (línea 1, columna 10)\n> 1 | function ( {\n    |          ^",
    );
  });

  it("HTML format shortens the closing-tag error but keeps its position and frame", async () => {
    expect(errorText(await formatHtml("<div><span></div>"))).toBe(
      "Etiqueta de cierre </div> inesperada: no corresponde al elemento abierto (línea 1, columna 12)\n> 1 | <div><span></div>\n    |            ^^^^^^",
    );
  });

  it("maps PostCSS 'node type: undefined' and leaves unknown errors alone", () => {
    expect(localizeServiceMessage(friendlySyntaxError(new Error("Unknown node type: undefined")) ?? "")).toBe(
      "Sintaxis CSS inválida",
    );
    expect(friendlySyntaxError(new Error("something else"))).toBeNull();
  });
});
