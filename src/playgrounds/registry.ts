import { lazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";
import type { PlaygroundConfig } from "@/types/playground";
import { jsonPlaygroundConfig } from "./json/json.config";
import { jsPlaygroundConfig } from "./js/js.config";
import { htmlPlaygroundConfig } from "./html/html.config";
import { cssPlaygroundConfig } from "./css/css.config";
import { colorsConfig } from "./colors/colors.config";
import { hashConfig } from "./hash/hash.config";
import { passwordConfig } from "./password/password.config";
import { timestampConfig } from "./timestamp/timestamp.config";
import { phpPlaygroundConfig } from "./php/php.config";
import { sqlPlaygroundConfig } from "./sql/sql.config";

export type PlaygroundRegistryItem = PlaygroundConfig & {
  component: LazyExoticComponent<ComponentType>;
};

interface RegistryEntry {
  config: PlaygroundConfig;
  load: () => Promise<{ default: ComponentType }>;
}

const entries: RegistryEntry[] = [
  {
    config: jsonPlaygroundConfig,
    load: () =>
      import("./json/JsonPlayground").then((m) => ({ default: m.JsonPlayground })),
  },
  {
    config: jsPlaygroundConfig,
    load: () =>
      import("./js/JsPlayground").then((m) => ({ default: m.JsPlayground })),
  },
  {
    config: htmlPlaygroundConfig,
    load: () =>
      import("./html/HtmlPlayground").then((m) => ({ default: m.HtmlPlayground })),
  },
  {
    config: cssPlaygroundConfig,
    load: () =>
      import("./css/CssPlayground").then((m) => ({ default: m.CssPlayground })),
  },
  {
    config: phpPlaygroundConfig,
    load: () =>
      import("./php/PhpPlayground").then((m) => ({ default: m.PhpPlayground })),
  },
  {
    config: sqlPlaygroundConfig,
    load: () =>
      import("./sql/SqlPlayground").then((m) => ({ default: m.SqlPlayground })),
  },
  {
    config: colorsConfig,
    load: () =>
      import("./colors/ColorsPlayground").then((m) => ({ default: m.ColorsPlayground })),
  },
  {
    config: hashConfig,
    load: () =>
      import("./hash/HashPlayground").then((m) => ({ default: m.HashPlayground })),
  },
  {
    config: passwordConfig,
    load: () =>
      import("./password/PasswordPlayground").then((m) => ({
        default: m.PasswordPlayground,
      })),
  },
  {
    config: timestampConfig,
    load: () =>
      import("./timestamp/TimestampPlayground").then((m) => ({
        default: m.TimestampPlayground,
      })),
  },
];

export const playgroundRegistry: PlaygroundRegistryItem[] = entries.map(
  ({ config, load }) => ({
    ...config,
    component: lazy(load),
  }),
);

const playgroundLoaders: Record<string, () => Promise<unknown>> = Object.fromEntries(
  entries.map(({ config, load }) => [config.id, load]),
);

export const getPlaygroundById = (id: string) =>
  playgroundRegistry.find((playground) => playground.id === id);

export const preloadPlaygroundById = async (id: string): Promise<void> => {
  const loader = playgroundLoaders[id];
  if (!loader) return;
  await loader();
};

export const preloadAllPlaygrounds = async (): Promise<void> => {
  await Promise.all(Object.values(playgroundLoaders).map((loader) => loader()));
};
