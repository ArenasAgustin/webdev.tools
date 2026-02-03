/**
 * LocalStorage Service
 * Centralized service for persistent storage operations
 */

import type { ToolsConfig } from "@/types/json";

/**
 * Storage keys constants
 */
export const STORAGE_KEYS = {
  TOOLS_CONFIG: "toolsConfig",
  LAST_JSON: "lastJson",
  JSONPATH_HISTORY: "jsonPathHistory",
} as const;

/**
 * Generic localStorage getter with type safety and error handling
 */
export function getItem<T>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(key);
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
    localStorage.setItem(key, JSON.stringify(value));
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
    localStorage.removeItem(key);
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
    localStorage.clear();
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
    const testKey = "__storage_test__";
    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);
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
    const item = localStorage.getItem(STORAGE_KEYS.LAST_JSON);
    return item || "";
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
    localStorage.setItem(STORAGE_KEYS.LAST_JSON, json);
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
