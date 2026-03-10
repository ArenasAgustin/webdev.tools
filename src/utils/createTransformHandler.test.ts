import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTransformHandler } from "./createTransformHandler";

describe("createTransformHandler", () => {
  const setOutput = vi.fn();
  const setError = vi.fn();

  let capturedConfig: {
    run: () => Promise<string>;
    onSuccess: (result: string) => void;
    onError: (message: string) => void;
    successMessage: string;
    errorMessage: string;
  };

  const runTransformAction = vi.fn((config) => {
    capturedConfig = config;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls runTransformAction with correct messages", () => {
    createTransformHandler({
      runTransformAction,
      run: () => Promise.resolve("result"),
      setOutput,
      setError,
      successMessage: "formatted",
      errorMessage: "format error",
    });

    expect(runTransformAction).toHaveBeenCalledOnce();
    expect(capturedConfig.successMessage).toBe("formatted");
    expect(capturedConfig.errorMessage).toBe("format error");
  });

  it("onSuccess sets output and clears error", () => {
    createTransformHandler({
      runTransformAction,
      run: () => Promise.resolve("result"),
      setOutput,
      setError,
      successMessage: "ok",
      errorMessage: "fail",
    });

    capturedConfig.onSuccess("formatted code");

    expect(setError).toHaveBeenCalledWith(null);
    expect(setOutput).toHaveBeenCalledWith("formatted code");
  });

  it("onSuccess triggers autoCopy when enabled and value is non-empty", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    createTransformHandler({
      runTransformAction,
      run: () => Promise.resolve("result"),
      setOutput,
      setError,
      autoCopy: true,
      successMessage: "ok",
      errorMessage: "fail",
    });

    capturedConfig.onSuccess("code");

    expect(writeText).toHaveBeenCalledWith("code");
  });

  it("onSuccess does not trigger autoCopy when disabled", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    createTransformHandler({
      runTransformAction,
      run: () => Promise.resolve("result"),
      setOutput,
      setError,
      autoCopy: false,
      successMessage: "ok",
      errorMessage: "fail",
    });

    capturedConfig.onSuccess("code");

    expect(writeText).not.toHaveBeenCalled();
  });

  it("onSuccess does not trigger autoCopy when value is empty", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    createTransformHandler({
      runTransformAction,
      run: () => Promise.resolve("result"),
      setOutput,
      setError,
      autoCopy: true,
      successMessage: "ok",
      errorMessage: "fail",
    });

    capturedConfig.onSuccess("");

    expect(writeText).not.toHaveBeenCalled();
  });

  it("onError sets compacted error message", () => {
    createTransformHandler({
      runTransformAction,
      run: () => Promise.resolve("result"),
      setOutput,
      setError,
      successMessage: "ok",
      errorMessage: "fail",
    });

    capturedConfig.onError("Some long\n  multiline\n  error message");

    expect(setError).toHaveBeenCalledWith("Some long");
  });

  it("passes the run function through", () => {
    const run = vi.fn().mockResolvedValue("output");

    createTransformHandler({
      runTransformAction,
      run,
      setOutput,
      setError,
      successMessage: "ok",
      errorMessage: "fail",
    });

    expect(capturedConfig.run).toBe(run);
  });
});
