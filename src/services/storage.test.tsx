import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getItem,
  setItem,
  removeItem,
  clearAll,
  loadToolsConfig,
  saveToolsConfig,
  loadLastJson,
  saveLastJson,
  loadJsToolsConfig,
  saveJsToolsConfig,
  loadLastJs,
  saveLastJs,
} from "./storage";
import type { ToolsConfig } from "@/types/json";
import type { JsToolsConfig } from "@/types/js";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("Storage Service", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe("Generic getItem/setItem/removeItem", () => {
    it("should store and retrieve a string value", () => {
      setItem("testKey", "testValue");
      expect(getItem("testKey")).toBe("testValue");
    });

    it("should store and retrieve an object value", () => {
      const testObj = { name: "Test", value: 42 };
      setItem("testObj", testObj);
      const retrieved = getItem<typeof testObj>("testObj");
      expect(retrieved).toEqual(testObj);
    });

    it("should store and retrieve an array value", () => {
      const testArray = [1, 2, 3];
      setItem("testArray", testArray);
      expect(getItem("testArray")).toEqual(testArray);
    });

    it("should return null when key does not exist", () => {
      expect(getItem("nonexistent")).toBeNull();
    });

    it("should return default value when provided and key not found", () => {
      const defaultValue = { default: true };
      expect(getItem("nonexistent", defaultValue)).toEqual(defaultValue);
    });

    it("should remove an item", () => {
      setItem("testKey", "testValue");
      removeItem("testKey");
      expect(getItem("testKey")).toBeNull();
    });

    it("should handle large data structures", () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        value: `item-${i}`,
      }));
      setItem("largeData", largeArray);
      const loaded = getItem<typeof largeArray>("largeData");
      expect(loaded).toHaveLength(1000);
      expect(loaded![0].id).toBe(0);
      expect(loaded![999].id).toBe(999);
    });

    it("should handle unicode characters", () => {
      const value = { text: "¡Hola! 你好 Привет 🚀✨" };
      setItem("unicodeTest", value);
      const loaded = getItem<typeof value>("unicodeTest");
      expect(loaded).toEqual(value);
    });

    it("should handle deeply nested structures", () => {
      const deepObj = {
        level1: {
          level2: {
            level3: {
              value: "deep",
            },
          },
        },
      };
      setItem("deepObject", deepObj);
      const loaded = getItem<typeof deepObj>("deepObject");
      expect(loaded!.level1.level2.level3.value).toBe("deep");
    });

    it("should handle numeric values", () => {
      const value = 42;
      setItem("numberTest", value);
      expect(getItem("numberTest")).toBe(value);
    });

    it("should handle boolean values", () => {
      setItem("boolTrue", true);
      setItem("boolFalse", false);
      expect(getItem("boolTrue")).toBe(true);
      expect(getItem("boolFalse")).toBe(false);
    });

    it("should handle null values in objects", () => {
      const obj = { field1: "value", field2: null };
      setItem("objectWithNull", obj);
      const loaded = getItem<typeof obj>("objectWithNull");
      expect(loaded!.field1).toBe("value");
      expect(loaded!.field2).toBeNull();
    });
  });

  describe("loadToolsConfig/saveToolsConfig", () => {
    it("should load tools config", () => {
      const config: Partial<ToolsConfig> = {
        format: { indent: 2, sortKeys: true, autoCopy: false },
      };
      saveToolsConfig(config);

      const loaded = loadToolsConfig();
      expect(loaded?.format?.indent).toBe(2);
      expect(loaded?.format?.sortKeys).toBe(true);
    });

    it("should return null when config doesn't exist", () => {
      const loaded = loadToolsConfig();
      expect(loaded).toBeNull();
    });

    it("should overwrite existing config", () => {
      const config1: Partial<ToolsConfig> = {
        format: { indent: 2, sortKeys: false, autoCopy: false },
      };
      const config2: Partial<ToolsConfig> = {
        format: { indent: 4, sortKeys: false, autoCopy: false },
      };

      saveToolsConfig(config1);
      saveToolsConfig(config2);

      const loaded = loadToolsConfig();
      expect(loaded?.format?.indent).toBe(4);
    });
  });

  describe("loadLastJson/saveLastJson", () => {
    it("should save and load last JSON as string", () => {
      const json = '{"name": "Test", "value": 42}';
      saveLastJson(json);

      const loaded = loadLastJson();
      expect(loaded).toBe(json);
    });

    it("should return empty string when no last JSON", () => {
      const loaded = loadLastJson();
      expect(loaded).toBe("");
    });

    it("should overwrite previous JSON", () => {
      const json1 = '{"test": 1}';
      const json2 = '{"test": 2}';

      saveLastJson(json1);
      saveLastJson(json2);

      const loaded = loadLastJson();
      expect(loaded).toBe(json2);
    });

    it("should preserve JSON formatting", () => {
      const json = JSON.stringify({ a: 1, b: 2 }, null, 2);
      saveLastJson(json);

      const loaded = loadLastJson();
      expect(loaded).toBe(json);
    });

    it("should handle large JSON", () => {
      const largeJson = JSON.stringify({
        data: Array.from({ length: 100 }, (_, i) => ({
          id: i,
          value: `item-${i}`,
        })),
      });
      saveLastJson(largeJson);

      const loaded = loadLastJson();
      expect(loaded).toBe(largeJson);
      // Verify it's still valid JSON
      const parsed = JSON.parse(loaded);
      expect(parsed.data).toHaveLength(100);
    });
  });

  describe("loadJsToolsConfig/saveJsToolsConfig", () => {
    it("should save and load JS tools config", () => {
      const config: Partial<JsToolsConfig> = { format: { indentSize: 2, autoCopy: false } };
      saveJsToolsConfig(config);

      const loaded = loadJsToolsConfig();
      expect(loaded?.format?.indentSize).toBe(2);
    });

    it("should return null when config doesn't exist", () => {
      const loaded = loadJsToolsConfig();
      expect(loaded).toBeNull();
    });

    it("should overwrite existing config", () => {
      const config1: Partial<JsToolsConfig> = { format: { indentSize: 2, autoCopy: false } };
      const config2: Partial<JsToolsConfig> = { format: { indentSize: 4, autoCopy: false } };

      saveJsToolsConfig(config1);
      saveJsToolsConfig(config2);

      const loaded = loadJsToolsConfig();
      expect(loaded?.format?.indentSize).toBe(4);
    });
  });

  describe("clearAll", () => {
    it("should clear all items from localStorage", () => {
      setItem("item1", "value1");
      setItem("item2", "value2");
      setItem("item3", { nested: "value" });

      clearAll();

      expect(getItem("item1")).toBeNull();
      expect(getItem("item2")).toBeNull();
      expect(getItem("item3")).toBeNull();
    });

    it("should handle clearing empty storage", () => {
      expect(() => clearAll()).not.toThrow();
    });
  });

  describe("Error handling", () => {
    it("should handle localStorage errors gracefully on read", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const brokenStorage = {
        getItem: () => {
          throw new Error("Storage error");
        },
        setItem: () => {
          throw new Error("Storage error");
        },
        removeItem: () => {
          throw new Error("Storage error");
        },
        clear: () => {
          throw new Error("Storage error");
        },
      };

      Object.defineProperty(window, "localStorage", { value: brokenStorage });

      const result = getItem("test");
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Restore
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      vi.restoreAllMocks();
    });

    it("should return null when parsing invalid JSON", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      localStorageMock.setItem("invalidJson", "not valid json");
      const result = getItem("invalidJson");
      expect(result).toBeNull(); // JSON.parse fails, returns null per error handling
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe("Integration tests", () => {
    it("should maintain data integrity through multiple operations", () => {
      const config1: Partial<ToolsConfig> = {
        format: { indent: 2, sortKeys: false, autoCopy: false },
      };
      const json1 = '{"test": 1}';
      const jsConfig1: Partial<JsToolsConfig> = { format: { indentSize: 2, autoCopy: false } };

      saveToolsConfig(config1);
      saveLastJson(json1);
      saveJsToolsConfig(jsConfig1);

      expect(loadToolsConfig()).toEqual(config1);
      expect(loadLastJson()).toBe(json1);
      expect(loadJsToolsConfig()).toEqual(jsConfig1);

      // Update one and verify others are unchanged
      const json2 = '{"test": 2}';
      saveLastJson(json2);

      expect(loadToolsConfig()).toEqual(config1);
      expect(loadLastJson()).toBe(json2);
      expect(loadJsToolsConfig()).toEqual(jsConfig1);
    });

    it("should handle sequential save and retrieve operations", () => {
      for (let i = 0; i < 10; i++) {
        const json = JSON.stringify({ iteration: i });
        saveLastJson(json);
        expect(loadLastJson()).toBe(json);
      }
    });
  });

  describe("Error handling - loadLastJson", () => {
    it("should return empty string when storage.getItem throws", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const brokenStorage = {
        getItem: () => {
          throw new Error("Storage read error");
        },
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
      };

      Object.defineProperty(window, "localStorage", { value: brokenStorage });

      const result = loadLastJson();
      expect(result).toBe("");
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error loading last JSON:", expect.any(Error));

      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      vi.restoreAllMocks();
    });
  });

  describe("Error handling - saveLastJson", () => {
    it("should return false when storage.setItem throws", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const brokenStorage = {
        getItem: () => null,
        setItem: () => {
          throw new Error("Storage write error");
        },
        removeItem: () => {},
        clear: () => {},
      };

      Object.defineProperty(window, "localStorage", { value: brokenStorage });

      const result = saveLastJson('{"test": 1}');
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error saving last JSON:", expect.any(Error));

      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      vi.restoreAllMocks();
    });
  });

  describe("Error handling - loadLastJs", () => {
    it("should return empty string when storage.getItem throws", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const brokenStorage = {
        getItem: () => {
          throw new Error("Storage read error");
        },
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
      };

      Object.defineProperty(window, "localStorage", { value: brokenStorage });

      const result = loadLastJs();
      expect(result).toBe("");
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error loading last JS:", expect.any(Error));

      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      vi.restoreAllMocks();
    });
  });

  describe("Error handling - saveLastJs", () => {
    it("should return false when storage.setItem throws", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const brokenStorage = {
        getItem: () => null,
        setItem: () => {
          throw new Error("Storage write error");
        },
        removeItem: () => {},
        clear: () => {},
      };

      Object.defineProperty(window, "localStorage", { value: brokenStorage });

      const result = saveLastJs("console.log('test')");
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error saving last JS:", expect.any(Error));

      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      vi.restoreAllMocks();
    });
  });
});
