/**
 * LocalStorage Service
 * Centralized service for persistent storage operations
 */

import type { ToolsConfig } from "@/types/json";
import type { JsToolsConfig } from "@/types/js";

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
  TOOLS_CONFIG: "toolsConfig",
  JS_TOOLS_CONFIG: "jsToolsConfig",
  LAST_JSON: "lastJson",
  LAST_JS: "lastJs",
  JSONPATH_HISTORY: "jsonPathHistory",
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
export function loadToolsConfig(): Partial<ToolsConfig> | null {
  return getItem<Partial<ToolsConfig>>(STORAGE_KEYS.TOOLS_CONFIG);
}

/**
 * Save tools configuration to localStorage
 */
export function saveToolsConfig(config: Partial<ToolsConfig>): boolean {
  return setItem(STORAGE_KEYS.TOOLS_CONFIG, config);
}

/**
 * Remove tools configuration from localStorage
 */
export function removeToolsConfig(): boolean {
  return removeItem(STORAGE_KEYS.TOOLS_CONFIG);
}

/**
 * Load last JSON input from localStorage
 */
export function loadLastJson(): string {
  try {
    const storage = getStorage();
    if (!storage) return "";

    const item = storage.getItem(STORAGE_KEYS.LAST_JSON);
    return item ?? "";
  } catch (error) {
    console.error("Error loading last JSON:", error);
    return "";
  }
}

/**
 * Save last JSON input to localStorage
 */
export function saveLastJson(json: string): boolean {
  try {
    const storage = getStorage();
    if (!storage) return false;

    storage.setItem(STORAGE_KEYS.LAST_JSON, json);
    return true;
  } catch (error) {
    console.error("Error saving last JSON:", error);
    return false;
  }
}

/**
 * Remove last JSON from localStorage
 */
export function removeLastJson(): boolean {
  return removeItem(STORAGE_KEYS.LAST_JSON);
}

// ============================================
// Specific storage functions for JS Tools
// ============================================

/**
 * Load last JS input from localStorage
 */
export function loadLastJs(): string {
  try {
    const storage = getStorage();
    if (!storage) return "";

    const item = storage.getItem(STORAGE_KEYS.LAST_JS);
    return item ?? "";
  } catch (error) {
    console.error("Error loading last JS:", error);
    return "";
  }
}

/**
 * Save last JS input to localStorage
 */
export function saveLastJs(code: string): boolean {
  try {
    const storage = getStorage();
    if (!storage) return false;

    storage.setItem(STORAGE_KEYS.LAST_JS, code);
    return true;
  } catch (error) {
    console.error("Error saving last JS:", error);
    return false;
  }
}

/**
 * Remove last JS from localStorage
 */
export function removeLastJs(): boolean {
  return removeItem(STORAGE_KEYS.LAST_JS);
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
