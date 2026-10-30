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

  it("removes nested workers and WebTransport, which would start with full network access", () => {
    const scope = {
      ...makeScope(),
      Worker: class {},
      SharedWorker: class {},
      WebTransport: class {},
    };
    lockDownWorkerGlobals(scope);
    expect(scope.Worker).toBeUndefined();
    expect(scope.SharedWorker).toBeUndefined();
    expect(scope.WebTransport).toBeUndefined();
  });

  it("removes navigator.storage (origin private file system), also from the prototype", () => {
    class FakeNavigator {
      get storage() {
        return { getDirectory: () => "opfs" };
      }
    }
    const navigator = new FakeNavigator();
    const scope = { ...makeScope(), navigator };
    lockDownWorkerGlobals(scope);
    expect(navigator.storage).toBeUndefined();
    const getter = Object.getOwnPropertyDescriptor(FakeNavigator.prototype, "storage")?.get;
    expect(getter?.call(navigator)).toBeUndefined();
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
