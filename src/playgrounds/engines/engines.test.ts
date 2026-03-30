import { describe, it, expect } from "vitest";
import { jsonEngine } from "./json.engine";
import { jsEngine } from "./js.engine";
import { htmlEngine } from "./html.engine";
import { cssEngine } from "./css.engine";

describe("Playground Engines", () => {
  describe("jsonEngine", () => {
    it("has correct id and config", () => {
      expect(jsonEngine.id).toBe("json");
      expect(jsonEngine.editorLanguage).toBe("json");
      expect(jsonEngine.features).toContain("clean");
      expect(jsonEngine.features).toContain("jsonPath");
    });

    it("maps base params to json-specific params", () => {
      const baseParams = {
        input: '{"test": 1}',
        setInput: () => {},
        output: "",
        setOutput: () => {},
        setError: () => {},
        formatConfig: { indentSize: 2 },
        minifyConfig: { removeSpaces: true },
        inputTooLarge: false,
        inputTooLargeMessage: "Too large",
        toast: { success: () => {}, error: () => {} },
      };

      const mapped = jsonEngine.mapActionsParams(baseParams);

      expect(mapped.inputJson).toBe(baseParams.input);
      expect(mapped.setInputJson).toBe(baseParams.setInput);
      expect(mapped.formatConfig).toBe(baseParams.formatConfig);
      expect(mapped.jsonPathExpression).toBeUndefined();
    });

    it("includes jsonPath params when provided", () => {
      const baseParams = {
        input: '{"test": 1}',
        setInput: () => {},
        output: "",
        setOutput: () => {},
        setError: () => {},
        formatConfig: { indentSize: 2 },
        minifyConfig: { removeSpaces: true },
        inputTooLarge: false,
        inputTooLargeMessage: "Too large",
        toast: { success: () => {}, error: () => {} },
        jsonPathExpression: "$.test",
        setJsonPathExpression: () => {},
        addToHistory: () => {},
      };

      const mapped = jsonEngine.mapActionsParams(baseParams);

      expect(mapped.jsonPathExpression).toBe("$.test");
      expect(mapped.setJsonPathExpression).toBeDefined();
      expect(mapped.addToHistory).toBeDefined();
    });

    it("has correct file config", () => {
      expect(jsonEngine.fileConfig.inputFileName).toBe("data.json");
      expect(jsonEngine.fileConfig.outputFileName).toBe("result.json");
      expect(jsonEngine.fileConfig.mimeType).toBe("application/json");
    });
  });

  describe("jsEngine", () => {
    it("has correct id and config", () => {
      expect(jsEngine.id).toBe("js");
      expect(jsEngine.editorLanguage).toBe("javascript");
      expect(jsEngine.features).toContain("execute");
    });

    it("maps base params to js-specific params", () => {
      const baseParams = {
        input: "console.log('hello')",
        setInput: () => {},
        output: "",
        setOutput: () => {},
        setError: () => {},
        formatConfig: { indentSize: 2 },
        minifyConfig: { removeComments: true },
        inputTooLarge: false,
        inputTooLargeMessage: "Too large",
        toast: { success: () => {}, error: () => {} },
      };

      const mapped = jsEngine.mapActionsParams(baseParams);

      expect(mapped.inputJs).toBe(baseParams.input);
      expect(mapped.setInputJs).toBe(baseParams.setInput);
    });

    it("has correct file config", () => {
      expect(jsEngine.fileConfig.inputFileName).toBe("script.js");
      expect(jsEngine.fileConfig.mimeType).toBe("text/javascript");
    });
  });

  describe("htmlEngine", () => {
    it("has correct id and config", () => {
      expect(htmlEngine.id).toBe("html");
      expect(htmlEngine.editorLanguage).toBe("html");
      expect(htmlEngine.features).toContain("preview");
    });

    it("maps base params to html-specific params", () => {
      const baseParams = {
        input: "<div>test</div>",
        setInput: () => {},
        output: "",
        setOutput: () => {},
        setError: () => {},
        formatConfig: { indentSize: 2 },
        minifyConfig: { removeComments: true },
        inputTooLarge: false,
        inputTooLargeMessage: "Too large",
        toast: { success: () => {}, error: () => {} },
      };

      const mapped = htmlEngine.mapActionsParams(baseParams);

      expect(mapped.inputHtml).toBe(baseParams.input);
      expect(mapped.setInputHtml).toBe(baseParams.setInput);
    });

    it("has correct file config", () => {
      expect(htmlEngine.fileConfig.inputFileName).toBe("index.html");
      expect(htmlEngine.fileConfig.mimeType).toBe("text/html");
    });
  });

  describe("cssEngine", () => {
    it("has correct id and config", () => {
      expect(cssEngine.id).toBe("css");
      expect(cssEngine.editorLanguage).toBe("css");
      expect(cssEngine.features).toHaveLength(0);
    });

    it("maps base params to css-specific params", () => {
      const baseParams = {
        input: ".test { color: red }",
        setInput: () => {},
        output: "",
        setOutput: () => {},
        setError: () => {},
        formatConfig: { indentSize: 2 },
        minifyConfig: { removeComments: true },
        inputTooLarge: false,
        inputTooLargeMessage: "Too large",
        toast: { success: () => {}, error: () => {} },
      };

      const mapped = cssEngine.mapActionsParams(baseParams);

      expect(mapped.inputCss).toBe(baseParams.input);
      expect(mapped.setInputCss).toBe(baseParams.setInput);
    });

    it("has correct file config", () => {
      expect(cssEngine.fileConfig.inputFileName).toBe("styles.css");
      expect(cssEngine.fileConfig.mimeType).toBe("text/css");
    });
  });

  describe("all engines", () => {
    it("have required properties", () => {
      const engines = [jsonEngine, jsEngine, htmlEngine, cssEngine];

      for (const engine of engines) {
        expect(engine.id).toBeDefined();
        expect(engine.config).toBeDefined();
        expect(engine.editorLanguage).toBeDefined();
        expect(engine.features).toBeDefined();
        expect(engine.defaultFormatConfig).toBeDefined();
        expect(engine.defaultMinifyConfig).toBeDefined();
        expect(engine.loadToolsConfig).toBeDefined();
        expect(engine.loadLastInput).toBeDefined();
        expect(engine.saveLastInput).toBeDefined();
        expect(engine.preload).toBeDefined();
        expect(engine.useParser).toBeDefined();
        expect(engine.useActions).toBeDefined();
        expect(engine.mapActionsParams).toBeDefined();
        expect(engine.fileConfig).toBeDefined();
      }
    });

    it("have valid file configs with all required fields", () => {
      const engines = [jsonEngine, jsEngine, htmlEngine, cssEngine];

      for (const engine of engines) {
        const { fileConfig } = engine;
        expect(fileConfig.inputFileName).toBeTruthy();
        expect(fileConfig.outputFileName).toBeTruthy();
        expect(fileConfig.mimeType).toBeTruthy();
        expect(fileConfig.language).toBeTruthy();
        expect(fileConfig.acceptExtensions).toBeTruthy();
        expect(fileConfig.exampleContent).toBeTruthy();
        expect(typeof fileConfig.formatRunner).toBe("function");
        expect(typeof fileConfig.minifyRunner).toBe("function");
      }
    });
  });
});
