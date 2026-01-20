/**
 * Base types for playground architecture
 * Defines the contract that all playgrounds must follow
 */

export interface PlaygroundConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  language: string;
  example: string;
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
