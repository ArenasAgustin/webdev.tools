import i18next from "i18next";

/**
 * Base types for playground architecture
 * Defines the contract that all playgrounds must follow
 */

export type LocalizedString = string | Record<string, string>;

export interface PlaygroundConfig {
  id: string;
  name: LocalizedString;
  icon: string;
  description: LocalizedString;
  language: string;
  example: string;
  keywords?: string[];
}

export interface PlaygroundFeature {
  id: string;
  name: string;
  icon: string;
  action: () => void;
}

/**
 * Base interface that all playgrounds should implement
 */
export interface Playground {
  config: PlaygroundConfig;
  features: PlaygroundFeature[];
}

/**
 * Extract localized string from LocalizedString type
 * Uses current i18n language or falls back to Spanish
 */
export function getLocalizedString(value: LocalizedString): string {
  if (typeof value === "string") return value;
  const lang = i18next.language || "es";
  return value[lang] || value.es || Object.values(value)[0] || "";
}
