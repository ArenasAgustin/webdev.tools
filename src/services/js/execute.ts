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

  const log = (prefix: string, args: unknown[]) => {
    const line = prefix + args.map((arg) => formatValue(arg)).join(" ");
    logs.push(line);
    options.onLog?.(line);
  };

  const sandboxConsole = {
    log: (...args: unknown[]) => log("", args),
    info: (...args: unknown[]) => log("", args),
    debug: (...args: unknown[]) => log("", args),
    table: (data: unknown) => {
      for (const line of formatTable(data)) {
        logs.push(line);
        options.onLog?.(line);
      }
    },
    error: (...args: unknown[]) => log("ERROR: ", args),
    warn: (...args: unknown[]) => log("WARN: ", args),
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
      code,
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

const bigintReplacer = (_key: string, value: unknown) =>
  typeof value === "bigint" ? `${value}n` : value;

export function formatValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return value;
  if (typeof value === "bigint") return `${value}n`;
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, bigintReplacer, 2);
    } catch {
      return Object.prototype.toString.call(value);
    }
  }
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return String(value);
  return Object.prototype.toString.call(value);
}

/** Single-line rendering of a `console.table` cell. */
function formatCell(value: unknown): string {
  if (typeof value === "object" && value !== null) {
    try {
      return JSON.stringify(value, bigintReplacer);
    } catch {
      return Object.prototype.toString.call(value);
    }
  }
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
