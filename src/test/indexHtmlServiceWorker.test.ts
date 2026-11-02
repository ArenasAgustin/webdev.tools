import { describe, expect, it, vi } from "vitest";

const fs = process.getBuiltinModule("node:fs");
const html = fs.readFileSync(`${process.cwd()}/index.html`, "utf8");

/** The inline SW self-heal script (the only classic `<script>` in index.html). */
const inlineScript = /<script>([\s\S]*?)<\/script>/.exec(html)?.[1] ?? "";

function runInlineScript(initialController: object | null) {
  const listeners: Record<string, () => void> = {};
  const reload = vi.fn();
  const serviceWorker = {
    controller: initialController,
    addEventListener: (type: string, listener: () => void) => {
      listeners[type] = listener;
    },
    getRegistration: () => Promise.resolve(undefined),
    getRegistrations: () => Promise.resolve([]),
  };
  const fakeWindow = { location: { reload }, addEventListener: vi.fn() };
  const fakeSessionStorage = { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() };

  // Shadow the globals the script touches so it runs against the fakes.
  new Function("navigator", "window", "sessionStorage", inlineScript)(
    { serviceWorker },
    fakeWindow,
    fakeSessionStorage,
  );

  return { fireControllerChange: () => listeners.controllerchange?.(), reload };
}

describe("index.html service worker bootstrap", () => {
  it("finds the inline script", () => {
    expect(inlineScript).toContain("controllerchange");
  });

  it("does not reload when the first service worker claims the page", () => {
    const { fireControllerChange, reload } = runInlineScript(null);

    fireControllerChange();

    expect(reload).not.toHaveBeenCalled();
  });

  it("reloads when a new service worker replaces an existing one", () => {
    const { fireControllerChange, reload } = runInlineScript({});

    fireControllerChange();

    expect(reload).toHaveBeenCalledOnce();
  });
});
