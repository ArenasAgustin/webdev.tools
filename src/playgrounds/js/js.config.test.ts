import { describe, it, expect, afterEach } from "vitest";
import i18n from "i18next";
import { jsPlaygroundConfig } from "./js.config";
import { phpPlaygroundConfig } from "@/playgrounds/php/php.config";
import { cleanJs } from "@/services/js/transform";
import { getJsonPathTips } from "@/playgrounds/json/jsonPathTips";

describe("built-in examples follow the UI language", () => {
  afterEach(async () => {
    await i18n.changeLanguage("es");
  });

  it("JS example is in English for the English UI", async () => {
    await i18n.changeLanguage("en");
    expect(jsPlaygroundConfig.example).toContain('console.log("Factorial of 5:", factorial(5));');
    expect(jsPlaygroundConfig.example).not.toMatch(/Ejemplo|años/);
  });

  it("JS example stays in Spanish for the Spanish UI", () => {
    expect(jsPlaygroundConfig.example).toContain('console.log("Factorial de 5:", factorial(5));');
  });

  it("PHP example is in English for the English UI", async () => {
    await i18n.changeLanguage("en");
    expect(phpPlaygroundConfig.example).toContain('echo "Factorial of 5: "');
    expect(phpPlaygroundConfig.example).not.toMatch(/Ejemplo|años/);
  });

  it("PHP example stays in Spanish for the Spanish UI", () => {
    expect(phpPlaygroundConfig.example).toContain('echo "Factorial de 5: "');
  });

  it.each(["es", "en"])("Clean really removes what the %s JS example says it removes", async (lng) => {
    await i18n.changeLanguage(lng);
    const example = jsPlaygroundConfig.example;
    const result = cleanJs(example);
    if (!result.ok) throw new Error(result.error);

    const declarations = example.split("\n").filter((line) => /^(const \w+ = (""|\[\]|\{\});|function \w+\(\) \{\})$/.test(line));
    expect(declarations).toHaveLength(4);
    for (const line of declarations) {
      expect(result.value).not.toContain(line);
    }
    // Everything else is kept
    expect(result.value).toContain("function factorial(n)");
    expect(result.value).toContain(".saludar()".replace("saludar", lng === "en" ? "greet" : "saludar"));
  });

  it("JSONPath tips use a language-neutral property name", () => {
    const codes = getJsonPathTips().flatMap((tip) => tip.items.map((item) => item.code));
    expect(codes).toContain("$.property");
    expect(codes).not.toContain("$.propiedad");
  });
});
