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
  const dispatchEvent = vi.fn();
  const fakeWindow: Record<string, unknown> = {
    location: { reload },
    addEventListener: vi.fn(),
    dispatchEvent,
  };
  const fakeSessionStorage = { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() };

  // Shadow the globals the script touches so it runs against the fakes.
  new Function("navigator", "window", "sessionStorage", inlineScript)(
    { serviceWorker },
    fakeWindow,
    fakeSessionStorage,
  );

  return {
    fireControllerChange: () => listeners.controllerchange?.(),
    reload,
    dispatchEvent,
    fakeWindow,
  };
}

describe("index.html service worker bootstrap", () => {
  it("finds the inline script", () => {
    expect(inlineScript).toContain("controllerchange");
  });

  it("neither reloads nor announces an update when the first service worker claims the page", () => {
    const { fireControllerChange, reload, dispatchEvent } = runInlineScript(null);

    fireControllerChange();

    expect(reload).not.toHaveBeenCalled();
    expect(dispatchEvent).not.toHaveBeenCalled();
  });

  it("announces a new version instead of reloading when a new service worker takes over", () => {
    const { fireControllerChange, reload, dispatchEvent, fakeWindow } = runInlineScript({});

    fireControllerChange();

    expect(reload).not.toHaveBeenCalled();
    expect(fakeWindow.__swUpdateReady).toBe(true);
    expect(dispatchEvent).toHaveBeenCalledOnce();
    expect((dispatchEvent.mock.calls[0]?.[0] as Event).type).toBe("sw-update-ready");
  });
});
