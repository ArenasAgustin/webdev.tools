import { lazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";
import type { PlaygroundConfig } from "@/types/playground";
import { jsonPlaygroundConfig } from "./json/json.config";
import { jsPlaygroundConfig } from "./js/js.config";

export type PlaygroundRegistryItem = PlaygroundConfig & {
  component: LazyExoticComponent<ComponentType>;
};

export const playgroundRegistry: PlaygroundRegistryItem[] = [
  {
    ...jsonPlaygroundConfig,
    component: lazy(() =>
      import("./json/JsonPlayground").then((module) => ({
        default: module.JsonPlayground,
      })),
    ),
  },
  {
    ...jsPlaygroundConfig,
    component: lazy(() =>
      import("./js/JsPlayground").then((module) => ({
        default: module.JsPlayground,
      })),
    ),
  },
];

export const getPlaygroundById = (id: string) =>
  playgroundRegistry.find((playground) => playground.id === id);
