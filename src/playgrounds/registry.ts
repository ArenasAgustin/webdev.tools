import { lazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";
import type { PlaygroundConfig } from "@/types/playground";
import { jsonPlaygroundConfig } from "./json/json.config";
import { jsPlaygroundConfig } from "./js/js.config";
import { htmlPlaygroundConfig } from "./html/html.config";

export type PlaygroundRegistryItem = PlaygroundConfig & {
  component: LazyExoticComponent<ComponentType>;
};

const loadJsonPlayground = () => import("./json/JsonPlayground");
const loadJsPlayground = () => import("./js/JsPlayground");
const loadHtmlPlayground = () => import("./html/HtmlPlayground");

const playgroundLoaders: Record<string, () => Promise<unknown>> = {
  [jsonPlaygroundConfig.id]: loadJsonPlayground,
  [jsPlaygroundConfig.id]: loadJsPlayground,
  [htmlPlaygroundConfig.id]: loadHtmlPlayground,
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
