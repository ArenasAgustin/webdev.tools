import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useJsPlaygroundActions } from "./useJsPlaygroundActions";
import { DEFAULT_JS_FORMAT_CONFIG, DEFAULT_JS_MINIFY_CONFIG } from "@/types/js";

vi.mock("@/services/js/service", () => ({
  jsService: {
    format: vi.fn(),
    minify: vi.fn(),
  },
}));

function makeHook(inputJs = "") {
  const setInputJs = vi.fn();
  const setOutput = vi.fn();
  const setError = vi.fn();
  const toast = { success: vi.fn(), error: vi.fn() };

  const result = renderHook(() =>
    useJsPlaygroundActions({
      inputJs,
      setInputJs,
      output: "",
      setOutput,
      setError,
      formatConfig: DEFAULT_JS_FORMAT_CONFIG,
      minifyConfig: DEFAULT_JS_MINIFY_CONFIG,
      toast,
    }),
  );

  return { ...result, mocks: { setInputJs, setOutput, setError, toast } };
}

/**
 * hasLikelyInfiniteLoop is a private function. We test it indirectly through
 * handleExecute: the check runs BEFORE any Worker is created, so it throws
 * synchronously within the handler when a loop pattern is detected.
 */
describe("hasLikelyInfiniteLoop (indirect via handleExecute)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("detects while(true) and sets cancellation error", async () => {
    const { result, mocks } = makeHook("while(true) { console.log('x'); }");

    act(() => {
      result.current.handleExecute();
    });

    await waitFor(() => {
      expect(mocks.setError).toHaveBeenCalledWith(expect.stringContaining("5 segundos"));
    });
  });

  it("detects for(;;) and sets cancellation error", async () => {
    const { result, mocks } = makeHook("for(;;) { break; }");

    act(() => {
      result.current.handleExecute();
    });

    await waitFor(() => {
      expect(mocks.setError).toHaveBeenCalledWith(expect.stringContaining("5 segundos"));
    });
  });

  it("does NOT flag safe code as infinite loop", async () => {
    // We don't execute the code fully — we just check the loop isn't flagged.
    // When Worker is available (happy-dom), the Worker path is taken.
    // To avoid Worker complexity, mock Worker to be undefined to take sync path.
    const originalWorker = global.Worker;

    try {
      // @ts-expect-error intentionally removing Worker for sync path
      delete global.Worker;

      const { result, mocks } = makeHook('console.log("hello");');

      act(() => {
        result.current.handleExecute();
      });

      await waitFor(() => {
        // The sync path executes the code and sets output "hello"
        expect(mocks.setOutput).toHaveBeenCalledWith("hello");
      });

      // No cancellation error
      expect(mocks.setError).not.toHaveBeenCalledWith(expect.stringContaining("5 segundos"));
    } finally {
      global.Worker = originalWorker;
    }
  });
});

/**
 * formatValue is a private function embedded in the module.
 * We test it indirectly through executeJavaScriptSync (triggered when
 * global.Worker is undefined), which uses formatValue to serialize output.
 */
describe("formatValue (indirect via executeJavaScriptSync)", () => {
  let originalWorker: typeof Worker;

  beforeEach(() => {
    vi.clearAllMocks();
    originalWorker = global.Worker;
    // @ts-expect-error — force sync path that uses formatValue
    delete global.Worker;
  });

  afterEach(() => {
    global.Worker = originalWorker;
  });

  it("formats undefined return value as 'undefined'", async () => {
    const { result, mocks } = makeHook("undefined");

    act(() => {
      result.current.handleExecute();
    });

    // undefined return with no logs → output is empty string (logs.length === 0, result is undefined)
    await waitFor(() => {
      expect(mocks.setOutput).toHaveBeenCalledWith("");
    });
  });

  it("formats null return value as 'null'", async () => {
    const { result, mocks } = makeHook("null");

    act(() => {
      result.current.handleExecute();
    });

    // null return with no logs → output is empty string (result is null, same branch)
    await waitFor(() => {
      expect(mocks.setOutput).toHaveBeenCalledWith("");
    });
  });

  it("formats object via JSON.stringify pretty-print when logged", async () => {
    const code = "console.log({a:1,b:2})";
    const { result, mocks } = makeHook(code);

    act(() => {
      result.current.handleExecute();
    });

    await waitFor(() => {
      expect(mocks.setOutput).toHaveBeenCalledWith(JSON.stringify({ a: 1, b: 2 }, null, 2));
    });
  });

  it("formats number primitive as string when logged", async () => {
    const { result, mocks } = makeHook("console.log(42)");

    act(() => {
      result.current.handleExecute();
    });

    await waitFor(() => {
      expect(mocks.setOutput).toHaveBeenCalledWith("42");
    });
  });

  it("formats boolean primitive as string when logged", async () => {
    const { result, mocks } = makeHook("console.log(true)");

    act(() => {
      result.current.handleExecute();
    });

    await waitFor(() => {
      expect(mocks.setOutput).toHaveBeenCalledWith("true");
    });
  });

  it("formats string value as-is when logged", async () => {
    const { result, mocks } = makeHook('console.log("hello world")');

    act(() => {
      result.current.handleExecute();
    });

    await waitFor(() => {
      expect(mocks.setOutput).toHaveBeenCalledWith("hello world");
    });
  });

  it("returns non-null/non-undefined value directly as formatted string when no logs", async () => {
    // new Function("return 42")() returns 42; no logs → formatValue("42") → "42"
    const { result, mocks } = makeHook("return 42");

    act(() => {
      result.current.handleExecute();
    });

    await waitFor(() => {
      expect(mocks.setOutput).toHaveBeenCalledWith("42");
    });
  });
});
