import { describe, it, expect } from "vitest";
import es from "../locales/es/translation.json";
import en from "../locales/en/translation.json";

// Rioplatense voseo and accents, as in the rest of the Spanish copy.
describe("Spanish copy", () => {
  it("accents Expresión", () => {
    expect(es.json.filterExpression).toBe("Expresión JSONPath");
  });

  it("uses voseo in the home headline and the JSONPath prompt", () => {
    expect(es.home.headline).toBe("Formateá, validá y transformá tu código al instante.");
    expect(es.messages.json.jsonPathRequired).toBe("Ingresá una expresión JSONPath");
  });

  it("translates the Base64 padding option and its error", () => {
    expect(es.base64.padding).toBe("Relleno");
    expect(es.base64.errorInvalidPadding).toBe("La entrada tiene un relleno Base64 inválido");
  });

  it("says 'Entrada', not the anglicism 'Input', in the Timestamp error", () => {
    expect(es.timestamp.invalidInput).toBe("Entrada inválida. Ingresá un timestamp o fecha válida.");
  });

  it("puts the English adjective before the language in the editor footer", () => {
    expect(en.editor.validLabel).toBe("Valid {{language}}");
    expect(en.editor.invalidLabel).toBe("Invalid {{language}}");
  });

  it("names JavaScript, not a capitalized 'Código', inside messages", () => {
    // Used as {{language}} mid-sentence: "No hay {{language}} para ejecutar"
    expect(es.messages.js.languageName).toBe("JavaScript");
  });
});
