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

export type PlaygroundRegistryItem = PlaygroundConfig & {
  component: LazyExoticComponent<ComponentType>;
};

const loadJsonPlayground = () => import("./json/JsonPlayground");
const loadJsPlayground = () => import("./js/JsPlayground");
const loadHtmlPlayground = () => import("./html/HtmlPlayground");
const loadCssPlayground = () => import("./css/CssPlayground");
const loadColorsPlayground = () => import("./colors/ColorsPlayground");
const loadHashPlayground = () => import("./hash/HashPlayground");
const loadPasswordPlayground = () => import("./password/PasswordPlayground");
const loadTimestampPlayground = () => import("./timestamp/TimestampPlayground");
const loadPhpPlayground = () => import("./php/PhpPlayground");

const playgroundLoaders: Record<string, () => Promise<unknown>> = {
  [jsonPlaygroundConfig.id]: loadJsonPlayground,
  [jsPlaygroundConfig.id]: loadJsPlayground,
  [htmlPlaygroundConfig.id]: loadHtmlPlayground,
  [cssPlaygroundConfig.id]: loadCssPlayground,
  [colorsConfig.id]: loadColorsPlayground,
  [hashConfig.id]: loadHashPlayground,
  [passwordConfig.id]: loadPasswordPlayground,
  [timestampConfig.id]: loadTimestampPlayground,
  [phpPlaygroundConfig.id]: loadPhpPlayground,
};

export const playgroundRegistry: PlaygroundRegistryItem[] = [
  {
    ...jsonPlaygroundConfig,
    component: lazy(() =>
      loadJsonPlayground().then((module) => ({
        default: module.JsonPlayground,
      })),
    ),
  },
  {
    ...jsPlaygroundConfig,
    component: lazy(() =>
      loadJsPlayground().then((module) => ({
        default: module.JsPlayground,
      })),
    ),
  },
  {
    ...htmlPlaygroundConfig,
    component: lazy(() =>
      loadHtmlPlayground().then((module) => ({
        default: module.HtmlPlayground,
      })),
    ),
  },
  {
    ...cssPlaygroundConfig,
    component: lazy(() =>
      loadCssPlayground().then((module) => ({
        default: module.CssPlayground,
      })),
    ),
  },
  {
    ...phpPlaygroundConfig,
    component: lazy(() =>
      loadPhpPlayground().then((module) => ({
        default: module.PhpPlayground,
      })),
    ),
  },
  {
    ...colorsConfig,
    component: lazy(() =>
      loadColorsPlayground().then((module) => ({
        default: module.ColorsPlayground,
      })),
    ),
  },
  {
    ...hashConfig,
    component: lazy(() =>
      loadHashPlayground().then((module) => ({
        default: module.HashPlayground,
      })),
    ),
  },
  {
    ...passwordConfig,
    component: lazy(() =>
      loadPasswordPlayground().then((module) => ({
        default: module.PasswordPlayground,
      })),
    ),
  },
  {
    ...timestampConfig,
    component: lazy(() =>
      loadTimestampPlayground().then((module) => ({
        default: module.TimestampPlayground,
      })),
    ),
  },
];

export const getPlaygroundById = (id: string) =>
  playgroundRegistry.find((playground) => playground.id === id);

export const preloadPlaygroundById = async (id: string): Promise<void> => {
  const loader = playgroundLoaders[id];
  if (!loader) {
    return;
  }

  await loader();
};

export const preloadAllPlaygrounds = async (): Promise<void> => {
  await Promise.all(Object.values(playgroundLoaders).map((loader) => loader()));
};
