/**
 * Generic configuration primitives shared across playgrounds
 */

/** Canonical configuration section names shared across playgrounds */
export type PlaygroundConfigSection = "format" | "minify" | "clean";

/** Stable base shape for any playground tool configuration object */
export type BaseToolConfig = Record<string, boolean | number | string>;

/** Base capability shared by most tool configs */
export interface AutoCopyConfig {
  autoCopy: boolean;
}

/** Generic utility to compose any options object with autocopy support */
export type ConfigWithAutoCopy<TOptions extends BaseToolConfig> = TOptions & AutoCopyConfig;

/** Generic map of tool configurations for a playground */
export type PlaygroundToolsConfig<TTools extends Partial<Record<PlaygroundConfigSection, object>>> =
  {
    [K in keyof TTools]: TTools[K];
  };
