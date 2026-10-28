/**
 * Runs user JavaScript and collects its console output, including output produced
 * asynchronously (promise callbacks, timers, code after `await`).
 *
 * The code runs as the body of an async function, so top-level `await` works and a
 * returned promise is awaited. `console` and the timer functions are shadowed by
 * parameters, so nothing global is patched. Execution is considered finished once
 * the body settled and no timer created by the code is still pending; an endless
 * `setInterval` therefore never finishes and must be bounded by the caller.
 *
 * This module runs inside the execution worker: it must stay free of i18next imports.
 */

import type { Directive, Statement } from "@babel/types";
import { serviceMessage } from "@/services/serviceMessage";

export interface JsRunResult {
  ok: boolean;
  output: string;
  error?: string;
}

/** Messages exchanged with the dedicated execution worker (`src/workers/jsExecWorker.ts`). */
export interface JsExecRequest {
  code: string;
}

export type JsExecResponse = { type: "log"; line: string } | { type: "done"; result: JsRunResult };

export interface JsRunOptions {
  /** Called with each console line as soon as it is written. */
  onLog?: (line: string) => void;
}

const IDLE_POLL_MS = 10;

type AsyncFunctionConstructor = new (...args: string[]) => (...args: unknown[]) => Promise<unknown>;

// eslint-disable-next-line @typescript-eslint/no-empty-function -- only its prototype is needed
const asyncFunctionPrototype = Object.getPrototypeOf(async function () {}) as {
  constructor: AsyncFunctionConstructor;
};
const AsyncFunction = asyncFunctionPrototype.constructor;

export async function runJavaScript(
  code: string,
  options: JsRunOptions = {},
): Promise<JsRunResult> {
  const logs: string[] = [];
  const pendingTimers = new Set<ReturnType<typeof setTimeout>>();
  let asyncError: unknown;
  let hasAsyncError = false;

  // Indentation added by console.group, two spaces per open group.
  let groupIndent = "";
  const timers = new Map<string, number>();
  const counters = new Map<string, number>();

  const emit = (line: string) => {
    const indented = groupIndent
      ? line
          .split("\n")
          .map((part) => groupIndent + part)
          .join("\n")
      : line;
    logs.push(indented);
    options.onLog?.(indented);
  };

  const log = (prefix: string, args: unknown[]) => {
    emit(prefix + args.map((arg) => formatValue(arg)).join(" "));
  };

  const elapsed = (label: string, start: number) =>
    `${label}: ${(performance.now() - start).toFixed(3)} ms`;

  const group = (...args: unknown[]) => {
    if (args.length > 0) log("", args);
    groupIndent += "  ";
  };

  // Browser-like versions of the console methods: they never throw, and timer or
  // counter misuse prints a warning like the browser console does.
  const sandboxConsole = {
    log: (...args: unknown[]) => log("", args),
    info: (...args: unknown[]) => log("", args),
    debug: (...args: unknown[]) => log("", args),
    dir: (value: unknown) => log("", [value]),
    table: (data: unknown) => {
      for (const line of formatTable(data)) emit(line);
    },
    error: (...args: unknown[]) => log("ERROR: ", args),
    warn: (...args: unknown[]) => log("WARN: ", args),
    trace: (...args: unknown[]) => log("Trace: ", args),
    assert: (condition?: unknown, ...args: unknown[]) => {
      if (!condition) log(args.length > 0 ? "ERROR: Assertion failed: " : "ERROR: Assertion failed", args);
    },
    group,
    groupCollapsed: group,
    groupEnd: () => {
      groupIndent = groupIndent.slice(2);
    },
    time: (label: unknown = "default") => {
      const name = String(label);
      if (timers.has(name)) log("WARN: ", [`Timer '${name}' already exists`]);
      else timers.set(name, performance.now());
    },
    timeLog: (label: unknown = "default", ...args: unknown[]) => {
      const name = String(label);
      const start = timers.get(name);
      if (start === undefined) log("WARN: ", [`Timer '${name}' does not exist`]);
      else log("", [elapsed(name, start), ...args]);
    },
    timeEnd: (label: unknown = "default") => {
      const name = String(label);
      const start = timers.get(name);
      if (start === undefined) {
        log("WARN: ", [`Timer '${name}' does not exist`]);
        return;
      }
      timers.delete(name);
      log("", [elapsed(name, start)]);
    },
    count: (label: unknown = "default") => {
      const name = String(label);
      const count = (counters.get(name) ?? 0) + 1;
      counters.set(name, count);
      log("", [`${name}: ${count}`]);
    },
    countReset: (label: unknown = "default") => {
      const name = String(label);
      if (counters.has(name)) counters.set(name, 0);
      else log("WARN: ", [`Count for '${name}' does not exist`]);
    },
    clear: () => {
      logs.length = 0;
    },
  };

  const recordAsyncError = (error: unknown) => {
    if (hasAsyncError) return;
    hasAsyncError = true;
    asyncError = error;
  };

  const runCallback = (callback: unknown, args: unknown[]) => {
    if (typeof callback !== "function") return;
    try {
      (callback as (...callbackArgs: unknown[]) => unknown)(...args);
    } catch (error) {
      recordAsyncError(error);
    }
  };

  const sandboxSetTimeout = (callback: unknown, delay?: number, ...args: unknown[]) => {
    const id = setTimeout(() => {
      pendingTimers.delete(id);
      runCallback(callback, args);
    }, delay);
    pendingTimers.add(id);
    return id;
  };

  const sandboxSetInterval = (callback: unknown, delay?: number, ...args: unknown[]) => {
    const id = setInterval(() => runCallback(callback, args), delay);
    pendingTimers.add(id);
    return id;
  };

  const sandboxClearTimer = (id: ReturnType<typeof setTimeout>) => {
    pendingTimers.delete(id);
    clearTimeout(id);
  };

  try {
    const userFunction = new AsyncFunction(
      "console",
      "setTimeout",
      "setInterval",
      "clearTimeout",
      "clearInterval",
      await returnTrailingExpression(code),
    );
    const result = await userFunction(
      sandboxConsole,
      sandboxSetTimeout,
      sandboxSetInterval,
      sandboxClearTimer,
      sandboxClearTimer,
    );

    while (pendingTimers.size > 0 && !hasAsyncError) {
      await new Promise((resolve) => setTimeout(resolve, IDLE_POLL_MS));
    }
    // One more macrotask lets promise callbacks queued by the last timer run.
    await new Promise((resolve) => setTimeout(resolve, 0));

    if (hasAsyncError) return failure(logs, asyncError);
    if (logs.length === 0 && result !== undefined && result !== null) {
      return { ok: true, output: formatValue(result) };
    }
    return { ok: true, output: logs.join("\n") };
  } catch (error) {
    return failure(logs, error);
  } finally {
    for (const id of pendingTimers) clearTimeout(id);
  }
}

/**
 * Like a console/REPL, show the value of a trailing bare expression (`1 + 2`,
 * `await fetchThing()`): rewrite that last statement into `return (expr);` on the same
 * line, so stack line numbers are unchanged. Code that doesn't parse is returned as is
 * and the Function constructor reports the syntax error.
 */
async function returnTrailingExpression(code: string): Promise<string> {
  let program: { body: Statement[]; directives: Directive[] };
  try {
    // Loaded on demand: only runs need it, and only inside the execution worker.
    const { parse } = await import("@babel/parser");
    program = parse(code, {
      sourceType: "script",
      allowAwaitOutsideFunction: true,
      allowReturnOutsideFunction: true,
    }).program;
  } catch {
    return code;
  }

  // A lone string literal (`"hi"`) parses as a directive, not as a statement.
  const last: Statement | Directive | undefined =
    program.body.at(-1) ?? (program.body.length === 0 ? program.directives.at(-1) : undefined);
  const expression =
    last?.type === "ExpressionStatement" ? last.expression : last?.type === "Directive" ? last.value : null;
  if (!last || !expression) return code;

  const { start, end } = last;
  const { start: exprStart, end: exprEnd } = expression;
  if (start == null || end == null || exprStart == null || exprEnd == null) return code;

  return `${code.slice(0, start)}return (${code.slice(exprStart, exprEnd)});${code.slice(end)}`;
}

function failure(logs: string[], error: unknown): JsRunResult {
  return {
    ok: false,
    output: logs.join("\n"),
    error: describeError(error),
  };
}

// The Function constructor puts two header lines ("async function anonymous(...", ") {")
// before the user code, so stack line numbers are offset by this much.
const FUNCTION_HEADER_LINES = 2;
// Frames of code built by the Function constructor: V8 "<anonymous>:L:C",
// Firefox "> AsyncFunction:L:C".
const USER_FRAME_PATTERN = /(?:<anonymous>|> (?:Async)?Function):(\d+):\d+/;

/**
 * Describe a thrown value as "Name: message", followed by the user code line when the
 * stack has one (as a `services.js.runtimeErrorAtLine` service message).
 */
export function describeError(error: unknown): string {
  if (!(error instanceof Error)) return formatValue(error);

  const message = error.message ? `${error.name}: ${error.message}` : error.name;
  const match = USER_FRAME_PATTERN.exec(error.stack ?? "");
  const line = match ? Number(match[1]) - FUNCTION_HEADER_LINES : 0;
  return line > 0 ? serviceMessage("services.js.runtimeErrorAtLine", { message, line }) : message;
}

// Bounds that keep a huge or deeply nested value from flooding the output.
const MAX_DEPTH = 20;
const MAX_ITEMS = 100;

function describeFunction(fn: (...args: unknown[]) => unknown): string {
  if (Function.prototype.toString.call(fn).startsWith("class")) {
    return `[class ${fn.name || "(anonymous)"}]`;
  }
  return fn.name ? `[Function: ${fn.name}]` : "[Function (anonymous)]";
}

function describeErrorValue(error: Error): string {
  return error.message ? `${error.name}: ${error.message}` : error.name;
}

/**
 * Text for objects printed as a single token: errors, regular expressions, dates and
 * promises (whose state cannot be read synchronously). Undefined for everything else.
 */
function describeLeafObject(value: object): string | undefined {
  if (value instanceof Error) return describeErrorValue(value);
  if (value instanceof RegExp) return String(value);
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "Invalid Date" : value.toISOString();
  }
  if (value instanceof Promise) return "Promise {}";
  return undefined;
}

/** Brackets around items: one per line when `space` is set, compact otherwise. */
function wrapItems(open: string, close: string, items: string[], space: string, indent: string) {
  if (items.length === 0) return open + close;
  if (!space) return open + items.join(",") + close;
  const inner = indent + space;
  return `${open}\n${items.map((item) => inner + item).join(",\n")}\n${indent}${close}`;
}

function moreItems(total: number, kind: "items" | "properties"): string[] {
  return total > MAX_ITEMS ? [`... ${total - MAX_ITEMS} more ${kind}`] : [];
}

/**
 * Render a value the way the browser console shows it, in a JSON-like layout:
 * quoted strings and keys, plus NaN, Infinity, -0, undefined, empty array slots,
 * regular expressions, dates, typed arrays, Map/Set, functions and errors as the
 * console prints them. `ancestors` holds the objects being rendered around this one,
 * so a value that contains itself prints "[Circular]" instead of recursing forever.
 * Getters are read like the console does when expanding them; one that throws prints
 * "[Exception: …]".
 */
function serialize(value: unknown, space: string, indent: string, ancestors: object[]): string {
  if (value === null) return "null";
  switch (typeof value) {
    case "undefined":
      return "undefined";
    case "string":
      return JSON.stringify(value);
    case "number":
      return Object.is(value, -0) ? "-0" : String(value);
    case "boolean":
      return String(value);
    case "bigint":
      return `${value}n`;
    case "symbol":
      return value.toString();
    case "function":
      return describeFunction(value as (...args: unknown[]) => unknown);
  }

  const object = value;
  if (ancestors.includes(object)) return "[Circular]";
  const leaf = describeLeafObject(object);
  if (leaf !== undefined) return leaf;
  if (ancestors.length >= MAX_DEPTH) return Array.isArray(object) ? "[Array]" : "[Object]";

  const nested = [...ancestors, object];
  const child = (item: unknown) => serialize(item, space, indent + space, nested);
  // Collection entries stay on one line, like the console's collapsed preview.
  const inline = (item: unknown) => serialize(item, "", "", nested);

  if (object instanceof Map) {
    const entries = [...object]
      .slice(0, MAX_ITEMS)
      .map(([key, val]) => `${inline(key)} => ${inline(val)}`);
    return `Map(${object.size}) {${[...entries, ...moreItems(object.size, "items")].join(", ")}}`;
  }
  if (object instanceof Set) {
    const items = [...object].slice(0, MAX_ITEMS).map(inline);
    return `Set(${object.size}) {${[...items, ...moreItems(object.size, "items")].join(", ")}}`;
  }
  if (ArrayBuffer.isView(object) && !(object instanceof DataView)) {
    const typed = object as unknown as ArrayLike<number | bigint>;
    const items = Array.from({ length: Math.min(typed.length, MAX_ITEMS) }, (_, i) => inline(typed[i]));
    const all = [...items, ...moreItems(typed.length, "items")];
    return `${object.constructor.name}(${typed.length}) [${all.join(", ")}]`;
  }

  const read = (key: string | number) => {
    try {
      return child((object as Record<string | number, unknown>)[key]);
    } catch (error) {
      const text = error instanceof Error ? describeErrorValue(error) : String(error);
      return `[Exception: ${text}]`;
    }
  };

  if (Array.isArray(object)) {
    const items = Array.from({ length: Math.min(object.length, MAX_ITEMS) }, (_, i) =>
      i in object ? read(i) : "empty",
    );
    return wrapItems("[", "]", [...items, ...moreItems(object.length, "items")], space, indent);
  }

  const keys = Object.keys(object);
  const separator = space ? ": " : ":";
  const properties = keys
    .slice(0, MAX_ITEMS)
    .map((key) => `${JSON.stringify(key)}${separator}${read(key)}`);
  return wrapItems("{", "}", [...properties, ...moreItems(keys.length, "properties")], space, indent);
}

/** Single-line rendering: strings quoted, objects compact. */
function formatInline(value: unknown): string {
  try {
    return serialize(value, "", "", []);
  } catch {
    return Object.prototype.toString.call(value);
  }
}

export function formatValue(value: unknown): string {
  if (typeof value === "string") return value;
  try {
    return serialize(value, "  ", "", []);
  } catch {
    return Object.prototype.toString.call(value);
  }
}

/** Single-line rendering of a `console.table` cell. */
function formatCell(value: unknown): string {
  if (typeof value === "object" && value !== null) return formatInline(value);
  return formatValue(value);
}

/**
 * Render `console.table` data as aligned text rows: an "(index)" column, one column per
 * property of the row objects and a "Values" column for primitive rows. Anything that is
 * not an object is logged as a plain value, like the browser console does.
 */
function formatTable(data: unknown): string[] {
  if (typeof data !== "object" || data === null) return [formatValue(data)];

  const rows = Object.entries(data as Record<string, unknown>);
  const columns: string[] = [];
  let hasValues = false;
  for (const [, row] of rows) {
    if (typeof row === "object" && row !== null) {
      for (const key of Object.keys(row)) if (!columns.includes(key)) columns.push(key);
    } else {
      hasValues = true;
    }
  }
  if (hasValues) columns.push("Values");

  const table = [
    ["(index)", ...columns],
    ...rows.map(([index, row]) => [
      index,
      ...columns.map((column) => {
        if (typeof row === "object" && row !== null) {
          return column in row ? formatCell((row as Record<string, unknown>)[column]) : "";
        }
        return column === "Values" ? formatCell(row) : "";
      }),
    ]),
  ];
  const widths = table[0].map((_, i) => Math.max(...table.map((cells) => cells[i].length)));
  return table.map((cells) => cells.map((cell, i) => cell.padEnd(widths[i])).join(" | "));
}
