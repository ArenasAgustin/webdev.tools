/**
 * Generic configuration primitives shared across playgrounds
 */

/** Base capability shared by most tool configs */
export interface AutoCopyConfig {
  autoCopy: boolean;
}

/** Generic utility to compose any options object with autocopy support */
export type ConfigWithAutoCopy<TOptions extends object> = TOptions & AutoCopyConfig;

/** Generic map of tool configurations for a playground */
export type PlaygroundToolsConfig<TTools extends Record<string, object>> = {
  [K in keyof TTools]: TTools[K];
};
