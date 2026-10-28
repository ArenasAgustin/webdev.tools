import { vi } from "vitest";
import { runJavaScript } from "@/services/js/execute";
import type { JsExecRequest, JsExecResponse } from "@/services/js/execute";

/**
 * Test stand-in for the JS execution worker (`src/workers/jsExecWorker.ts`). jsdom has
 * no Worker and the playground refuses to run code without one, so tests install this
 * class as the global Worker: it runs the code in-process through `runJavaScript`
 * (respecting any `vi.mock` of that module) and speaks the same message protocol.
 */
export class InProcessJsExecWorker {
  onmessage: ((event: MessageEvent<JsExecResponse>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  private terminated = false;

  postMessage(request: JsExecRequest) {
    void runJavaScript(request.code, {
      onLog: (line) => this.emit({ type: "log", line }),
    }).then((result) => this.emit({ type: "done", result }));
  }

  terminate() {
    this.terminated = true;
  }

  private emit(message: JsExecResponse) {
    if (this.terminated) return;
    this.onmessage?.({ data: message } as MessageEvent<JsExecResponse>);
  }
}

/** Install `InProcessJsExecWorker` as the global Worker (undo with `vi.unstubAllGlobals`). */
export function stubJsExecWorker() {
  vi.stubGlobal("Worker", InProcessJsExecWorker);
}
