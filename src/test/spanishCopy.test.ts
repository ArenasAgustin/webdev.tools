import { describe, it, expect } from "vitest";
import es from "../locales/es/translation.json";

// Rioplatense voseo and accents, as in the rest of the Spanish copy.
describe("Spanish copy", () => {
  it("accents Expresión", () => {
    expect(es.json.filterExpression).toBe("Expresión JSONPath");
  });

  it("uses voseo in the home headline and the JSONPath prompt", () => {
    expect(es.home.headline).toBe("Formateá, validá y transformá tu código al instante.");
    expect(es.messages.json.jsonPathRequired).toBe("Ingresá una expresión JSONPath");
  });

  it("names JavaScript, not a capitalized 'Código', inside messages", () => {
    // Used as {{language}} mid-sentence: "No hay {{language}} para ejecutar"
    expect(es.messages.js.languageName).toBe("JavaScript");
  });
});
