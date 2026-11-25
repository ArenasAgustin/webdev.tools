import { describe, it, expect } from "vitest";

type PluginLike = { name?: string } | PluginLike[] | false | null | undefined;
type ViteConfigLike = { plugins?: PluginLike[] };

async function runViteFinal(config: ViteConfigLike): Promise<string[]> {
  // A variable specifier keeps .storybook/main.ts out of the app's type-checked program.
  const specifier = "../../.storybook/main.ts";
  const mod = (await import(/* @vite-ignore */ specifier)) as {
    default: { viteFinal?: (config: ViteConfigLike) => ViteConfigLike | Promise<ViteConfigLike> };
  };
  expect(mod.default.viteFinal).toBeTypeOf("function");
  const result = await mod.default.viteFinal!(config);
  const flat = ((result.plugins ?? []) as unknown[]).flat(Infinity) as { name?: string }[];
  return flat.filter(Boolean).map((plugin) => plugin.name ?? "");
}

// Storybook reuses vite.config.ts, so without this the PWA plugin generates a service
// worker for the Storybook build and fails on its >2 MiB manager bundle.
describe("storybook vite config", () => {
  it("drops the PWA plugins inherited from vite.config.ts", async () => {
    const names = await runViteFinal({
      plugins: [
        { name: "vite:react-babel" },
        [{ name: "vite-plugin-pwa" }, { name: "vite-plugin-pwa:build" }],
        { name: "vite-plugin-pwa:dev-sw" },
      ],
    });

    expect(names).toEqual(["vite:react-babel"]);
  });

  it("keeps every other plugin untouched", async () => {
    const names = await runViteFinal({
      plugins: [{ name: "vite:react-babel" }, [{ name: "storybook:docgen" }], false],
    });

    expect(names).toEqual(["vite:react-babel", "storybook:docgen"]);
  });
});
