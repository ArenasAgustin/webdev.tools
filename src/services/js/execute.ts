/**
 * Runs user JavaScript and collects its console output, including output produced
 * asynchronously (promise callbacks, timers, code after `await`).
 *
 * The code runs as the body of an async function, so top-level `await` works and a
 * returned promise is awaited. `console` and the timer functions are shadowed by
 * parameters, so nothing global is patched. Execution is considered finished once
 * the body settled and no timer created by the code is still pending; an endless
 * `setInterval` therefore never finishes and must be bounded by the caller.
 */

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
    error: error instanceof Error ? error.message : String(error),
  };
}

export function formatValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return Object.prototype.toString.call(value);
    }
  }
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return String(value);
  return Object.prototype.toString.call(value);
}
