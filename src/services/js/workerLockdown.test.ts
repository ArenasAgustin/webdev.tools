// @vitest-environment node
import { describe, it, expect } from "vitest";
import { lockDownWorkerGlobals } from "./workerLockdown";

function makeScope() {
  return {
    fetch: () => "net",
    WebSocket: class {},
    XMLHttpRequest: class {},
    EventSource: class {},
    importScripts: () => undefined,
    indexedDB: { open: () => "db" },
    caches: { open: () => "cache" },
    navigator: { sendBeacon: () => true, userAgent: "test" },
    postMessage: () => undefined,
  };
}

describe("lockDownWorkerGlobals", () => {
  it("removes network APIs", () => {
    const scope = makeScope();
    lockDownWorkerGlobals(scope);
    expect(scope.fetch).toBeUndefined();
    expect(scope.WebSocket).toBeUndefined();
    expect(scope.XMLHttpRequest).toBeUndefined();
    expect(scope.EventSource).toBeUndefined();
    expect(scope.importScripts).toBeUndefined();
    expect(scope.navigator.sendBeacon).toBeUndefined();
  });

  it("removes the site's IndexedDB and Cache Storage", () => {
    const scope = makeScope();
    lockDownWorkerGlobals(scope);
    expect(scope.indexedDB).toBeUndefined();
    expect(scope.caches).toBeUndefined();
  });

  it("cannot be undone by reassigning", () => {
    const scope = makeScope() as Record<string, unknown>;
    lockDownWorkerGlobals(scope);
    expect(() => {
      "use strict";
      scope.indexedDB = { open: () => "db" };
    }).toThrow(TypeError);
    expect(scope.indexedDB).toBeUndefined();
  });

  it("leaves everything else alone", () => {
    const scope = makeScope();
    lockDownWorkerGlobals(scope);
    expect(typeof scope.postMessage).toBe("function");
    expect(scope.navigator.userAgent).toBe("test");
  });
});
