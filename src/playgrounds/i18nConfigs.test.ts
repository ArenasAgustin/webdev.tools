import { afterEach, describe, expect, it } from "vitest";
import i18n from "i18next";
import { getLocalizedString } from "@/types/playground";
import { cssPlaygroundConfig } from "./css/css.config";
import { htmlPlaygroundConfig } from "./html/html.config";
import { jsPlaygroundConfig } from "./js/js.config";
import { jsonPlaygroundConfig } from "./json/json.config";
import { phpPlaygroundConfig } from "./php/php.config";
import { sqlPlaygroundConfig } from "./sql/sql.config";
import { getJsonPathQuickExamples, getJsonPathTips } from "./json/jsonPathTips";

const configs = [
  cssPlaygroundConfig,
  htmlPlaygroundConfig,
  jsPlaygroundConfig,
  jsonPlaygroundConfig,
  phpPlaygroundConfig,
  sqlPlaygroundConfig,
];

describe("playground config i18n", () => {
  afterEach(async () => {
    await i18n.changeLanguage("es");
  });

  it.each(configs.map((config) => [config.id, config]))(
    "%s description has distinct Spanish and English text",
    (_id, config) => {
      expect(typeof config.description).toBe("object");
      const description = config.description as Record<string, string>;
      expect(description.es).toBeTruthy();
      expect(description.en).toBeTruthy();
      expect(description.en).not.toBe(description.es);
    },
  );

  it("resolves a regional English locale to the English description", async () => {
    await i18n.changeLanguage("en-US");

    expect(getLocalizedString(jsonPlaygroundConfig.description)).toBe(
      (jsonPlaygroundConfig.description as Record<string, string>).en,
    );
  });

  it("translates JSONPath tips and quick examples", async () => {
    await i18n.changeLanguage("en");
    const enTips = getJsonPathTips();
    const enExamples = getJsonPathQuickExamples();

    await i18n.changeLanguage("es");
    const esTips = getJsonPathTips();
    const esExamples = getJsonPathQuickExamples();

    expect(enTips[0].category).toBe("Basic Access");
    expect(esTips[0].category).toBe("Acceso Básico");
    expect(enTips[0].items[0].description).toBe("Access from the root");
    expect(enExamples[0].description).toBe("Full array");
    expect(esExamples[0].description).toBe("Array completo");
    expect(enTips.map((tip) => tip.items[0].code)).toEqual(
      esTips.map((tip) => tip.items[0].code),
    );
  });
});
