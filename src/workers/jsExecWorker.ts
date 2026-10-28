import { describeError, runJavaScript } from "@/services/js/execute";
import type { JsExecRequest, JsExecResponse } from "@/services/js/execute";
import { lockDownWorkerGlobals } from "@/services/js/workerLockdown";

const ctx = self as unknown as {
  postMessage: (message: JsExecResponse) => void;
  onmessage: (event: MessageEvent<JsExecRequest>) => void;
  addEventListener: (
    type: "unhandledrejection",
    listener: (event: PromiseRejectionEvent) => void,
  ) => void;
};

// Best-effort: remove network APIs and the site's IndexedDB / Cache Storage before any
// user code runs. Not a security boundary, see lockDownWorkerGlobals.
lockDownWorkerGlobals(self);

let unhandledRejection: string | null = null;

// A promise rejected without a handler would otherwise surface as an uncaught
// error in the host page; report it as the run's error instead.
ctx.addEventListener("unhandledrejection", (event) => {
  event.preventDefault();
  unhandledRejection ??= describeError(event.reason);
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
