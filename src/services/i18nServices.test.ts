import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "i18next";
import { cssService } from "@/services/css/service";
import { jsonService } from "@/services/json/service";
import { phpService } from "@/services/php/service";
import { sqlService } from "@/services/sql/service";
import { applyJsonPathAsync, cleanJsonAsync } from "@/services/json/worker";
import { cleanCssAsync } from "@/services/css/worker";
import { executePhpWithTimeout } from "@/services/php/phpExecutor";
import type { PhpExecResponse } from "@/services/php/phpExecutor";

class FakeWorker {
  static instances: FakeWorker[] = [];
  onmessage: ((event: MessageEvent<PhpExecResponse>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;

  constructor() {
    FakeWorker.instances.push(this);
  }

  postMessage() {}

  terminate() {}

  emit(message: PhpExecResponse) {
    this.onmessage?.({ data: message } as MessageEvent<PhpExecResponse>);
  }
}

// Transforms run inside workers where i18next is not initialized, so they emit
// message keys; the main-thread service layer must turn them into localized text.
describe("service errors i18n (English)", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  afterEach(async () => {
    await i18n.changeLanguage("es");
    vi.useRealTimers();
    vi.unstubAllGlobals();
    FakeWorker.instances = [];
  });

  it("translates empty-input validator messages", async () => {
    expect(await jsonService.validate("  ")).toEqual({
      ok: false,
      error: "No JSON to process",
    });
    expect(await cssService.validate("")).toEqual({
      ok: false,
      error: "No CSS to process",
    });
  });

  it("translates transform errors surfaced by service validators", async () => {
    expect(await sqlService.validate("   ")).toEqual({
      ok: false,
      error: "The SQL is empty",
    });

    const php = await phpService.validate("<?php $a = ;");
    expect(php.ok).toBe(false);
    if (!php.ok) expect(php.error).toMatch(/^Syntax error on line \d+: /);
  });

  it("translates errors returned by async worker wrappers", async () => {
    const empty = await cleanJsonAsync("");
    expect(empty).toEqual({ ok: false, error: { message: "The JSON is empty" } });

    const path = await applyJsonPathAsync('{"a":1}', "  ");
    expect(path).toEqual({ ok: false, error: { message: "The JSONPath expression is empty" } });

    const css = await cleanCssAsync("");
    expect(css.ok).toBe(false);
    if (!css.ok) expect(css.error.message).toBe("The CSS is empty");
  });

  it("translates the PHP execution timeout and keeps empty output empty", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("Worker", FakeWorker);

    const timedOut = executePhpWithTimeout("while(true){}", 2000);
    FakeWorker.instances[0].emit({ type: "started" });
    await vi.advanceTimersByTimeAsync(2000);
    await expect(timedOut).resolves.toEqual({
      ok: false,
      error: { message: "Execution exceeded 2 seconds and was cancelled" },
    });

    const silent = executePhpWithTimeout("$a = 1;", 2000);
    FakeWorker.instances[1].emit({ type: "started" });
    FakeWorker.instances[1].emit({
      type: "done",
      result: { ok: true, value: "" },
    });
    await expect(silent).resolves.toEqual({ ok: true, value: "" });
  });
});

describe("service errors i18n (Spanish)", () => {
  it("keeps the Spanish copy on the main-thread path", async () => {
    expect(await jsonService.validate("")).toEqual({
      ok: false,
      error: "No hay JSON para procesar",
    });
    await expect(cleanJsonAsync("")).resolves.toEqual({
      ok: false,
      error: { message: "El JSON está vacío" },
    });

    const php = await phpService.validate("<?php $a = ;");
    if (!php.ok) expect(php.error).toMatch(/^Error de sintaxis en línea \d+: /);
  });
});
