/**
 * LocalStorage Service
 * Centralized service for persistent storage operations
 */

import type { JsonToolsConfig } from "@/types/json";
import type { JsToolsConfig } from "@/types/js";
import type { HtmlToolsConfig } from "@/types/html";
import type { PhpToolsConfig } from "@/types/php";
import type { CssToolsConfig } from "@/types/css";

const getStorage = (): Storage | null => {
  if (typeof window !== "undefined" && window.localStorage) {
    const storage = window.localStorage;
    if (
      typeof storage.getItem === "function" &&
      typeof storage.setItem === "function" &&
      typeof storage.removeItem === "function" &&
      typeof storage.clear === "function"
    ) {
      return storage;
    }
  }

  return null;
};

/**
 * Storage keys constants
 */
export const STORAGE_KEYS = {
  JSON_TOOLS_CONFIG: "jsonToolsConfig",
  JS_TOOLS_CONFIG: "jsToolsConfig",
  HTML_TOOLS_CONFIG: "htmlToolsConfig",
  CSS_TOOLS_CONFIG: "cssToolsConfig",
  PHP_TOOLS_CONFIG: "phpToolsConfig",
  LAST_PHP: "lastPhp",
  LAST_JSON: "lastJson",
  LAST_JS: "lastJs",
  LAST_HTML: "lastHtml",
  LAST_CSS: "lastCss",
  JSONPATH_HISTORY: "jsonPathHistory",
  PWA_INSTALL_DISMISSED: "pwaInstallDismissed",
} as const;

/**
 * Generic localStorage getter with type safety and error handling
 */
export function getItem<T>(key: string, defaultValue?: T): T | null {
  try {
    const storage = getStorage();
    if (!storage) return defaultValue ?? null;

    const item = storage.getItem(key);
    if (item === null) {
      return defaultValue ?? null;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue ?? null;
  }
}

/**
 * Generic localStorage setter with error handling
 */
export function setItem<T>(key: string, value: T): boolean {
  try {
    const storage = getStorage();
    if (!storage) return false;

    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Remove item from localStorage
 */
export function removeItem(key: string): boolean {
  try {
    const storage = getStorage();
    if (!storage) return false;

    storage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Clear all localStorage
 */
export function clearAll(): boolean {
  try {
    const storage = getStorage();
    if (!storage) return false;

    storage.clear();
    return true;
  } catch (error) {
    console.error("Error clearing localStorage:", error);
    return false;
  }
}

/**
 * Check if localStorage is available
 */
export function isAvailable(): boolean {
  try {
    const storage = getStorage();
    if (!storage) return false;

    const testKey = "__storage_test__";
    storage.setItem(testKey, "test");
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

// ============================================
// Specific storage functions for JSON Tools
// ============================================

/**
 * Load tools configuration from localStorage
 */
export function loadJsonToolsConfig(): Partial<JsonToolsConfig> | null {
  return getItem<Partial<JsonToolsConfig>>(STORAGE_KEYS.JSON_TOOLS_CONFIG);
}

/**
 * Save tools configuration to localStorage
 */
export function saveJsonToolsConfig(config: Partial<JsonToolsConfig>): boolean {
  return setItem(STORAGE_KEYS.JSON_TOOLS_CONFIG, config);
}

/**
 * Remove tools configuration from localStorage
 */
export function removeJsonToolsConfig(): boolean {
  return removeItem(STORAGE_KEYS.JSON_TOOLS_CONFIG);
}

/**
 * Load JS tools configuration from localStorage
 */
export function loadJsToolsConfig(): Partial<JsToolsConfig> | null {
  return getItem<Partial<JsToolsConfig>>(STORAGE_KEYS.JS_TOOLS_CONFIG);
}

/**
 * Save JS tools configuration to localStorage
 */
export function saveJsToolsConfig(config: Partial<JsToolsConfig>): boolean {
  return setItem(STORAGE_KEYS.JS_TOOLS_CONFIG, config);
}

/**
 * Remove JS tools configuration from localStorage
 */
export function removeJsToolsConfig(): boolean {
  return removeItem(STORAGE_KEYS.JS_TOOLS_CONFIG);
}

/**
 * Load HTML tools configuration from localStorage
 */
export function loadHtmlToolsConfig(): Partial<HtmlToolsConfig> | null {
  return getItem<Partial<HtmlToolsConfig>>(STORAGE_KEYS.HTML_TOOLS_CONFIG);
}

/**
 * Save HTML tools configuration to localStorage
 */
export function saveHtmlToolsConfig(config: Partial<HtmlToolsConfig>): boolean {
  return setItem(STORAGE_KEYS.HTML_TOOLS_CONFIG, config);
}

/**
 * Remove HTML tools configuration from localStorage
 */
export function removeHtmlToolsConfig(): boolean {
  return removeItem(STORAGE_KEYS.HTML_TOOLS_CONFIG);
}

/**
 * Load CSS tools configuration from localStorage
 */
export function loadCssToolsConfig(): Partial<CssToolsConfig> | null {
  return getItem<Partial<CssToolsConfig>>(STORAGE_KEYS.CSS_TOOLS_CONFIG);
}

/**
 * Save CSS tools configuration to localStorage
 */
export function saveCssToolsConfig(config: Partial<CssToolsConfig>): boolean {
  return setItem(STORAGE_KEYS.CSS_TOOLS_CONFIG, config);
}

/**
 * Remove CSS tools configuration from localStorage
 */
export function removeCssToolsConfig(): boolean {
  return removeItem(STORAGE_KEYS.CSS_TOOLS_CONFIG);
}

// ============================================
// Generic Last Input functions (internal)
// ============================================

const loadLastInput = (key: string, errorName: string): string => {
  try {
    const storage = getStorage();
    if (!storage) return "";
    const item = storage.getItem(key);
    return item ?? "";
  } catch (error) {
    console.error(`Error loading last ${errorName}:`, error);
    return "";
  }
};

const saveLastInput = (key: string, errorName: string, value: string): boolean => {
  try {
    const storage = getStorage();
    if (!storage) return false;
    storage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error saving last ${errorName}:`, error);
    return false;
  }
};

// ============================================
// Last Input functions for each playground
// ============================================

/** Load last JSON input from localStorage */
export const loadLastJson = () => loadLastInput(STORAGE_KEYS.LAST_JSON, "JSON");

/** Save last JSON input to localStorage */
export const saveLastJson = (value: string) => saveLastInput(STORAGE_KEYS.LAST_JSON, "JSON", value);

/** Remove last JSON from localStorage */
export const removeLastJson = () => removeItem(STORAGE_KEYS.LAST_JSON);

/** Load last JS input from localStorage */
export const loadLastJs = () => loadLastInput(STORAGE_KEYS.LAST_JS, "JS");

/** Save last JS input to localStorage */
export const saveLastJs = (value: string) => saveLastInput(STORAGE_KEYS.LAST_JS, "JS", value);

/** Remove last JS from localStorage */
export const removeLastJs = () => removeItem(STORAGE_KEYS.LAST_JS);

/** Load last HTML input from localStorage */
export const loadLastHtml = () => loadLastInput(STORAGE_KEYS.LAST_HTML, "HTML");

/** Save last HTML input to localStorage */
export const saveLastHtml = (value: string) => saveLastInput(STORAGE_KEYS.LAST_HTML, "HTML", value);

/** Remove last HTML from localStorage */
export const removeLastHtml = () => removeItem(STORAGE_KEYS.LAST_HTML);

/** Load last CSS input from localStorage */
export const loadLastCss = () => loadLastInput(STORAGE_KEYS.LAST_CSS, "CSS");

/** Save last CSS input to localStorage */
export const saveLastCss = (value: string) => saveLastInput(STORAGE_KEYS.LAST_CSS, "CSS", value);

/** Remove last CSS from localStorage */
export const removeLastCss = () => removeItem(STORAGE_KEYS.LAST_CSS);

/** Load PHP tools configuration from localStorage */
export function loadPhpToolsConfig(): Partial<PhpToolsConfig> | null {
  return getItem<Partial<PhpToolsConfig>>(STORAGE_KEYS.PHP_TOOLS_CONFIG);
}

/** Save PHP tools configuration to localStorage */
export function savePhpToolsConfig(config: Partial<PhpToolsConfig>): boolean {
  return setItem(STORAGE_KEYS.PHP_TOOLS_CONFIG, config);
}

/** Remove PHP tools configuration from localStorage */
export function removePhpToolsConfig(): boolean {
  return removeItem(STORAGE_KEYS.PHP_TOOLS_CONFIG);
}

/** Load last PHP input from localStorage */
export const loadLastPhp = () => loadLastInput(STORAGE_KEYS.LAST_PHP, "PHP");

/** Save last PHP input to localStorage */
export const saveLastPhp = (value: string) => saveLastInput(STORAGE_KEYS.LAST_PHP, "PHP", value);

/** Remove last PHP from localStorage */
export const removeLastPhp = () => removeItem(STORAGE_KEYS.LAST_PHP);
