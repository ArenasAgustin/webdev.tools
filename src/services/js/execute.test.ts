// @vitest-environment node
import { describe, it, expect } from "vitest";
import { runJavaScript } from "@/services/js/execute";

describe("runJavaScript", () => {
  it("returns console output joined by newlines", async () => {
    const result = await runJavaScript(
      'console.log("a", 1); console.warn("w"); console.error("e");',
    );
    expect(result).toEqual({ ok: true, output: "a 1\nWARN: w\nERROR: e" });
  });

  it("returns the completion value when nothing is logged", async () => {
    expect(await runJavaScript("return { a: 1 };")).toEqual({
      ok: true,
      output: '{\n  "a": 1\n}',
    });
  });

  it("awaits a returned promise instead of printing it as an object", async () => {
    expect(await runJavaScript("return Promise.resolve(42);")).toEqual({ ok: true, output: "42" });
  });

  it("supports top-level await", async () => {
    const result = await runJavaScript("const v = await Promise.resolve(3); console.log(v * 2);");
    expect(result).toEqual({ ok: true, output: "6" });
  });

  it("captures logs from then callbacks and timers", async () => {
    const result = await runJavaScript(`
      Promise.resolve().then(() => console.log("then"));
      setTimeout(() => console.log("timeout"), 20);
      console.log("sync");
    `);
    expect(result).toEqual({ ok: true, output: "sync\nthen\ntimeout" });
  });

  it("does not wait for cleared timers", async () => {
    const result = await runJavaScript(`
      const id = setTimeout(() => console.log("never"), 10_000);
      clearTimeout(id);
      console.log("done");
    `);
    expect(result).toEqual({ ok: true, output: "done" });
  });

  it("keeps logs written before a synchronous throw", async () => {
    const result = await runJavaScript('console.log("before"); throw new Error("boom");');
    expect(result).toEqual({ ok: false, output: "before", error: "boom" });
  });

  it("reports errors thrown inside timer callbacks", async () => {
    const result = await runJavaScript(`
      console.log("start");
      setTimeout(() => { throw new Error("late"); }, 5);
    `);
    expect(result).toEqual({ ok: false, output: "start", error: "late" });
  });

  it("reports a rejected returned promise as an error", async () => {
    const result = await runJavaScript('return Promise.reject(new Error("nope"));');
    expect(result).toEqual({ ok: false, output: "", error: "nope" });
  });

  it("streams each log line to the onLog callback", async () => {
    const lines: string[] = [];
    await runJavaScript('console.log("x"); setTimeout(() => console.log("y"), 5);', {
      onLog: (line) => lines.push(line),
    });
    expect(lines).toEqual(["x", "y"]);
  });
});
