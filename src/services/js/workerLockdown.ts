/**
 * Best-effort lockdown of the JS execution worker's globals before user code runs.
 *
 * The execution worker is a same-origin worker, so without this the user's code could
 * make network requests or read and write the site's IndexedDB databases and Cache
 * Storage. Each listed global is replaced with `undefined` on the worker scope.
 *
 * This is NOT a security boundary: other channels (e.g. BroadcastChannel, prototype
 * tricks, globals added by future browsers) stay reachable. It only removes the
 * obvious ways for a pasted snippet to touch the network or the site's storage.
 */

/** Network APIs. */
const NETWORK_GLOBALS = ["fetch", "WebSocket", "XMLHttpRequest", "EventSource", "importScripts"];
/** Same-origin persistent storage shared with the site. */
const STORAGE_GLOBALS = ["indexedDB", "caches"];

export const LOCKED_WORKER_GLOBALS: readonly string[] = [...NETWORK_GLOBALS, ...STORAGE_GLOBALS];

function shadow(target: object, name: string) {
  try {
    Object.defineProperty(target, name, { value: undefined, writable: false, configurable: false });
  } catch {
    // Non-configurable in this runtime; leave it as is.
  }
}

export function lockDownWorkerGlobals(scope: object & { navigator?: object }) {
  for (const name of LOCKED_WORKER_GLOBALS) shadow(scope, name);
  if (scope.navigator) shadow(scope.navigator, "sendBeacon");
}
