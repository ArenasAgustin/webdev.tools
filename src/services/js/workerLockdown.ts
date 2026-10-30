/**
 * Best-effort lockdown of the JS execution worker's globals before user code runs.
 *
 * The execution worker is a same-origin worker, so without this the user's code could
 * make network requests or read and write the site's IndexedDB databases, Cache
 * Storage and origin private file system. Each listed global is replaced with
 * `undefined` on the worker scope. Nested workers are removed too: a new worker starts
 * with fresh, unrestricted globals.
 *
 * This is NOT a security boundary: other channels (e.g. BroadcastChannel, dynamic
 * `import()` of a remote module, prototype tricks, globals added by future browsers)
 * stay reachable. Blocking those needs a Content-Security-Policy on the worker script.
 * It only removes the obvious ways for a pasted snippet to touch the network or the
 * site's storage.
 */

/** Network APIs. */
const NETWORK_GLOBALS = [
  "fetch",
  "WebSocket",
  "WebTransport",
  "XMLHttpRequest",
  "EventSource",
  "importScripts",
];
/** Nested workers, which would run with the APIs removed here. */
const WORKER_GLOBALS = ["Worker", "SharedWorker"];
/** Same-origin persistent storage shared with the site. */
const STORAGE_GLOBALS = ["indexedDB", "caches"];

export const LOCKED_WORKER_GLOBALS: readonly string[] = [
  ...NETWORK_GLOBALS,
  ...WORKER_GLOBALS,
  ...STORAGE_GLOBALS,
];

function shadow(target: object, name: string) {
  try {
    Object.defineProperty(target, name, { value: undefined, writable: false, configurable: false });
  } catch {
    // Non-configurable in this runtime; leave it as is.
  }
}

/**
 * Shadow a navigator member on the instance and on the prototype that defines it, so
 * the original getter cannot be read back from `Object.getPrototypeOf(navigator)`.
 */
function shadowNavigatorMember(navigator: object, name: string) {
  shadow(navigator, name);
  const prototype: unknown = Object.getPrototypeOf(navigator);
  if (prototype && prototype !== Object.prototype && Object.hasOwn(prototype, name)) {
    shadow(prototype, name);
  }
}

export function lockDownWorkerGlobals(scope: object & { navigator?: object }) {
  for (const name of LOCKED_WORKER_GLOBALS) shadow(scope, name);
  if (scope.navigator) {
    shadowNavigatorMember(scope.navigator, "sendBeacon");
    // StorageManager: origin private file system (getDirectory) and storage estimates.
    shadowNavigatorMember(scope.navigator, "storage");
  }
}
