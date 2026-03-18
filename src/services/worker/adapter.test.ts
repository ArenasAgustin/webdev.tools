import { describe, it, expect, vi } from "vitest";

import type { WorkerPayloadBase } from "./types";
import { createPlaygroundWorkerAdapter } from "./adapter";

if (typeof global.Worker === "undefined") {
  global.Worker = class {
    onmessage: ((ev: { data: { id: string; ok: boolean; value?: string } }) => void) | null = null;
    onmessageerror: ((ev: { data: { id: string; ok: boolean; value?: string } }) => void) | null =
      null;
    onerror: ((ev: unknown) => void) | null = null;
    terminate = vi.fn();
    postMessage = vi.fn((msg: { id: string }) => {
      setTimeout(() => {
        if (this.onmessage) {
          const event = { data: { id: msg.id, ok: true, value: "ok" } };
          this.onmessage(event);
        }
      }, 1);
    });
    addEventListener = vi.fn();
    removeEventListener = vi.fn();
    dispatchEvent = vi.fn();
  } as unknown as typeof Worker;
}

describe("createPlaygroundWorkerAdapter", () => {
  interface TestPayload extends WorkerPayloadBase {
    action: string;
  }
  it("envía y recibe mensajes correctamente", async () => {
    const adapter = createPlaygroundWorkerAdapter<
      TestPayload,
      { id: string; input: string; action: string },
      { id: string; ok: boolean; value?: string }
    >({
      workerUrl: new URL("worker.ts", import.meta.url),
      idPrefix: "test-worker",
      unavailableMessage: "No disponible",
      buildRequest: (id, payload) => ({ id, ...payload }),
    });
    const result = await adapter.run({ input: "test", action: "format" });
    expect(result.ok).toBe(true);
    expect(result.value).toBe("ok");
  });
});
