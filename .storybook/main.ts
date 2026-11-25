import type { StorybookConfig } from "@storybook/react-vite";
import type { PluginOption } from "vite";

const isPwaPlugin = (plugin: PluginOption): boolean =>
  typeof plugin === "object" &&
  plugin !== null &&
  "name" in plugin &&
  typeof plugin.name === "string" &&
  plugin.name.startsWith("vite-plugin-pwa");

/**
 * Storybook reuses vite.config.ts, which includes VitePWA. A service worker is
 * meaningless for Storybook, and generating one fails on the manager bundle
 * (larger than the 2 MiB precache limit), so the PWA plugins are dropped.
 */
const withoutPwa = (plugins: PluginOption[]): PluginOption[] =>
  plugins
    .filter((plugin) => !isPwaPlugin(plugin))
    .map((plugin) => (Array.isArray(plugin) ? withoutPwa(plugin) : plugin));

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
  ],
  framework: "@storybook/react-vite",
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    plugins: withoutPwa(viteConfig.plugins ?? []),
  }),
};
export default config;
