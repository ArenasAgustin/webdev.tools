import { formatValue, runJavaScript } from "@/services/js/execute";
import type { JsExecRequest, JsExecResponse } from "@/services/js/execute";

const ctx = self as unknown as {
  postMessage: (message: JsExecResponse) => void;
  onmessage: (event: MessageEvent<JsExecRequest>) => void;
  addEventListener: (
    type: "unhandledrejection",
    listener: (event: PromiseRejectionEvent) => void,
  ) => void;
};

// Restrict network access: block the most common browser network APIs.
// Note: this is a best-effort sandbox — other exotic channels (e.g. SharedArrayBuffer
// messaging) are not blocked. Do NOT rely on this for security-critical isolation.
for (const name of ["fetch", "WebSocket", "XMLHttpRequest", "EventSource", "importScripts"]) {
  try {
    Object.defineProperty(self, name, { value: undefined, writable: false, configurable: false });
  } catch {
    // Non-configurable in this runtime; leave it as is.
  }
}
try {
  Object.defineProperty(navigator, "sendBeacon", {
    value: undefined,
    writable: false,
    configurable: false,
  });
} catch {
  // Non-configurable in this runtime; leave it as is.
}

let unhandledRejection: string | null = null;

// A promise rejected without a handler would otherwise surface as an uncaught
// error in the host page; report it as the run's error instead.
ctx.addEventListener("unhandledrejection", (event) => {
  event.preventDefault();
  const reason: unknown = event.reason;
  unhandledRejection ??= reason instanceof Error ? reason.message : formatValue(reason);
});

// `unhandledrejection` is dispatched as its own task, which can land after the
// runner's final tick; give it a short window before reporting the result.
const REJECTION_SETTLE_MS = 20;

ctx.onmessage = (event: MessageEvent<JsExecRequest>) => {
  unhandledRejection = null;

  void runJavaScript(event.data.code, {
    onLog: (line) => ctx.postMessage({ type: "log", line }),
  }).then(async (result) => {
    await new Promise((resolve) => setTimeout(resolve, REJECTION_SETTLE_MS));
    const final =
      result.ok && unhandledRejection !== null
        ? { ok: false, output: result.output, error: unhandledRejection }
        : result;
    ctx.postMessage({ type: "done", result: final });
  });
};
