// @vitest-environment node
import { describe, it, expect } from "vitest";
import { formatValue, runJavaScript } from "@/services/js/execute";
import { serviceMessage } from "@/services/serviceMessage";

const atLine = (message: string, line: number) =>
  serviceMessage("services.js.runtimeErrorAtLine", { message, line });

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

  it("shows the value of a trailing bare expression when nothing is logged", async () => {
    expect(await runJavaScript("1 + 2")).toEqual({ ok: true, output: "3" });
    expect(await runJavaScript("const a = [1, 2];\na.map((n) => n * 2);")).toEqual({
      ok: true,
      output: "[\n  2,\n  4\n]",
    });
    expect(await runJavaScript('"hi" // trailing comment')).toEqual({ ok: true, output: "hi" });
  });

  it("awaits a trailing top-level await expression", async () => {
    expect(await runJavaScript("await Promise.resolve(7)")).toEqual({ ok: true, output: "7" });
  });

  it("keeps the user code line numbers after rewriting the trailing expression", async () => {
    const result = await runJavaScript("const x = 1;\nnull.foo");
    expect(result.ok).toBe(false);
    expect(result.error).toBe(
      atLine("TypeError: Cannot read properties of null (reading 'foo')", 2),
    );
  });

  it("prints nothing extra when the last statement is not an expression", async () => {
    expect(await runJavaScript("const a = 1;")).toEqual({ ok: true, output: "" });
    expect(await runJavaScript("console.log(5)")).toEqual({ ok: true, output: "5" });
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
    expect(result).toEqual({ ok: false, output: "before", error: atLine("Error: boom", 1) });
  });

  it("reports errors thrown inside timer callbacks", async () => {
    const result = await runJavaScript(`
      console.log("start");
      setTimeout(() => { throw new Error("late"); }, 5);
    `);
    expect(result).toEqual({ ok: false, output: "start", error: atLine("Error: late", 3) });
  });

  it("reports a rejected returned promise as an error", async () => {
    const result = await runJavaScript('return Promise.reject(new Error("nope"));');
    expect(result).toEqual({ ok: false, output: "", error: atLine("Error: nope", 1) });
  });

  it("streams each log line to the onLog callback", async () => {
    const lines: string[] = [];
    await runJavaScript('console.log("x"); setTimeout(() => console.log("y"), 5);', {
      onLog: (line) => lines.push(line),
    });
    expect(lines).toEqual(["x", "y"]);
  });

  it("captures console.info, console.debug and console.table", async () => {
    const result = await runJavaScript(
      'console.info("i"); console.debug("d"); console.table([{ a: 1, b: "x" }, { a: 2 }]);',
    );
    expect(result.ok).toBe(true);
    expect(result.output.split("\n")).toEqual([
      "i",
      "d",
      "(index) | a | b",
      "0       | 1 | x",
      "1       | 2 |  ",
    ]);
  });

  it("prints BigInt values with the n suffix, also inside objects", async () => {
    const result = await runJavaScript("console.log(10n, { big: 2n ** 64n });");
    expect(result.output).toBe('10n {\n  "big": "18446744073709551616n"\n}');
  });

  it("names the error type and the user code line of a runtime error", async () => {
    const result = await runJavaScript("const a = 1;\nconst b = null;\nb.foo;");
    expect(result).toEqual({
      ok: false,
      output: "",
      error: atLine("TypeError: Cannot read properties of null (reading 'foo')", 3),
    });
  });

  it("names the error type of a syntax error even without line info", async () => {
    const result = await runJavaScript("const = 1;");
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/^SyntaxError: /);
  });

  it("reports thrown non-Error values as they are", async () => {
    const result = await runJavaScript('throw "plain";');
    expect(result).toEqual({ ok: false, output: "", error: "plain" });
  });
});

describe("runJavaScript console methods", () => {
  const run = async (code: string) => {
    const result = await runJavaScript(code);
    expect(result.ok).toBe(true);
    return result.output;
  };

  it("prints console.dir like console.log", async () => {
    expect(await run("console.dir({ a: 1 })")).toBe('{\n  "a": 1\n}');
  });

  it("measures console.time / timeLog / timeEnd and warns on unknown timers", async () => {
    const output = await run(
      'console.time("t"); console.timeLog("t", "mid"); console.timeEnd("t"); console.timeEnd("t"); console.time(); console.timeEnd();',
    );
    const lines = output.split("\n");
    expect(lines[0]).toMatch(/^t: \d+(\.\d+)? ms mid$/);
    expect(lines[1]).toMatch(/^t: \d+(\.\d+)? ms$/);
    expect(lines[2]).toBe("WARN: Timer 't' does not exist");
    expect(lines[3]).toMatch(/^default: \d+(\.\d+)? ms$/);
  });

  it("indents output inside console.group / groupCollapsed until groupEnd", async () => {
    expect(
      await run(
        'console.group("g"); console.log(1); console.groupCollapsed("h"); console.log({ a: 1 }); console.groupEnd(); console.groupEnd(); console.groupEnd(); console.log(2)',
      ),
    ).toBe('g\n  1\n  h\n    {\n      "a": 1\n    }\n2');
  });

  it("prints failed assertions only", async () => {
    expect(
      await run('console.assert(true, "no"); console.assert(false, "boom", 1); console.assert(0)'),
    ).toBe("ERROR: Assertion failed: boom 1\nERROR: Assertion failed");
  });

  it("counts per label and resets counters", async () => {
    expect(
      await run(
        'console.count(); console.count(); console.count("x"); console.countReset(); console.count(); console.countReset("y")',
      ),
    ).toBe("default: 1\ndefault: 2\nx: 1\ndefault: 1\nWARN: Count for 'y' does not exist");
  });

  it("prints console.trace with its message", async () => {
    expect(await run('console.trace("here", 1)')).toBe("Trace: here 1");
  });

  it("drops earlier output on console.clear", async () => {
    expect(await run('console.log("old"); console.clear(); console.log("new")')).toBe("new");
  });
});

describe("formatValue", () => {
  it("formats a bare BigInt", () => {
    expect(formatValue(5n)).toBe("5n");
  });

  it("formats an Error as name and message instead of {}", () => {
    expect(formatValue(new TypeError("bad input"))).toBe("TypeError: bad input");
    expect(formatValue(new Error(""))).toBe("Error");
  });

  it("formats Map and Set with their entries instead of {}", () => {
    expect(
      formatValue(
        new Map<unknown, unknown>([
          ["a", 1],
          [2, { b: true }],
        ]),
      ),
    ).toBe('Map(2) {"a" => 1, 2 => {"b":true}}');
    expect(formatValue(new Set([1, "x"]))).toBe('Set(2) {1, "x"}');
    expect(formatValue(new Map())).toBe("Map(0) {}");
  });

  it("prints a collection that contains itself as [Circular]", () => {
    const set = new Set<unknown>();
    set.add(set);
    expect(formatValue(set)).toBe("Set(1) {[Circular]}");
  });

  it("formats functions by name instead of [object Function]", () => {
    function namedFn() {
      return 1;
    }
    expect(formatValue(namedFn)).toBe("[Function: namedFn]");
    expect(formatValue(() => 1)).toBe("[Function (anonymous)]");
    expect(formatValue(class Point {})).toBe("[class Point]");
  });

  it("formats symbols by description", () => {
    expect(formatValue(Symbol("id"))).toBe("Symbol(id)");
  });

  it("keeps special values readable when nested inside objects", () => {
    function handler() {
      return 1;
    }
    const value = { err: new RangeError("too big"), tags: new Set(["a"]), handler };
    expect(JSON.parse(formatValue(value))).toEqual({
      err: "RangeError: too big",
      tags: 'Set(1) {"a"}',
      handler: "[Function: handler]",
    });
  });
});
