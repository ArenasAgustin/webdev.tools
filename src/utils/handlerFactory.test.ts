import { describe, it, expect, vi } from "vitest";
import { createValidatedHandler } from "./handlerFactory";

describe("createValidatedHandler", () => {
  it("blocks execution when validate returns message", () => {
    const run = vi.fn();
    const toast = { success: vi.fn(), error: vi.fn() };

    const handler = createValidatedHandler({
      validate: () => "blocked",
      run,
      toast,
    });

    handler();

    expect(run).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("blocked");
  });

  it("runs when validate returns null", () => {
    const toast = { success: vi.fn(), error: vi.fn() };
    const run = vi.fn().mockReturnValue({ ok: true });

    const handler = createValidatedHandler({ validate: () => null, run, toast, successMessage: "done" });
    handler();

    expect(run).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("done");
  });

  it("shows success message on successful execution", () => {
    const toast = { success: vi.fn(), error: vi.fn() };

    const handler = createValidatedHandler({
      run: () => ({ ok: true }),
      toast,
      successMessage: "ok",
    });

    handler();

    expect(toast.success).toHaveBeenCalledWith("ok");
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("handles result-like failures", () => {
    const toast = { success: vi.fn(), error: vi.fn() };

    const handler = createValidatedHandler({
      run: () => ({ ok: false, error: "service error" }),
      toast,
      errorMessage: "fallback",
    });

    handler();

    expect(toast.error).toHaveBeenCalledWith("service error");
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("uses errorMessage fallback when result.error is missing", () => {
    const toast = { success: vi.fn(), error: vi.fn() };

    const handler = createValidatedHandler({
      run: () => ({ ok: false }),
      toast,
      errorMessage: "fallback error",
    });

    handler();

    expect(toast.error).toHaveBeenCalledWith("fallback error");
  });

  it("handles thrown errors with fallback", () => {
    const toast = { success: vi.fn(), error: vi.fn() };

    const handler = createValidatedHandler({
      run: () => {
        throw new Error("boom");
      },
      toast,
      errorMessage: "fallback",
    });

    handler();

    expect(toast.error).toHaveBeenCalledWith("boom");
  });

  it("handles thrown string errors", () => {
    const toast = { success: vi.fn(), error: vi.fn() };

    const handler = createValidatedHandler({
      run: () => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw "string error";
      },
      toast,
    });

    handler();

    expect(toast.error).toHaveBeenCalledWith("string error");
  });

  it("uses fallback when thrown error has no message", () => {
    const toast = { success: vi.fn(), error: vi.fn() };

    const handler = createValidatedHandler({
      run: () => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw {};
      },
      toast,
      errorMessage: "default fallback",
    });

    handler();

    expect(toast.error).toHaveBeenCalledWith("default fallback");
  });

  it("treats object with non-boolean ok as success", () => {
    const toast = { success: vi.fn(), error: vi.fn() };

    const handler = createValidatedHandler({
      run: () => ({ ok: "yes" } as unknown as { ok: boolean }),
      toast,
      successMessage: "done",
    });

    handler();

    expect(toast.success).toHaveBeenCalledWith("done");
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("calls onSuccess with result on sync success", () => {
    const toast = { success: vi.fn(), error: vi.fn() };
    const onSuccess = vi.fn();

    const handler = createValidatedHandler({
      run: () => ({ ok: true, data: 42 }),
      toast,
      successMessage: "done",
      onSuccess,
    });

    handler();

    expect(onSuccess).toHaveBeenCalledWith({ ok: true, data: 42 });
    expect(toast.success).toHaveBeenCalledWith("done");
  });

  it("calls onError when validation fails", () => {
    const toast = { success: vi.fn(), error: vi.fn() };
    const onError = vi.fn();

    const handler = createValidatedHandler({
      validate: () => "invalid input",
      run: vi.fn(),
      toast,
      onError,
    });

    handler();

    expect(onError).toHaveBeenCalledWith("invalid input");
  });

  it("handles async run that resolves ok", async () => {
    const toast = { success: vi.fn(), error: vi.fn() };

    const handler = createValidatedHandler({
      run: () => Promise.resolve({ ok: true }),
      toast,
      successMessage: "async ok",
    });

    handler();
    await new Promise((r) => setTimeout(r, 10));

    expect(toast.success).toHaveBeenCalledWith("async ok");
  });

  it("handles async run that resolves with error", async () => {
    const toast = { success: vi.fn(), error: vi.fn() };

    const handler = createValidatedHandler({
      run: () => Promise.resolve({ ok: false, error: "async error" }),
      toast,
    });

    handler();
    await new Promise((r) => setTimeout(r, 10));

    expect(toast.error).toHaveBeenCalledWith("async error");
  });

  it("handles async run that rejects", async () => {
    const toast = { success: vi.fn(), error: vi.fn() };

    const handler = createValidatedHandler({
      run: () => Promise.reject(new Error("rejected")),
      toast,
    });

    handler();
    await new Promise((r) => setTimeout(r, 10));

    expect(toast.error).toHaveBeenCalledWith("rejected");
  });

  it("handles async onSuccess that resolves", async () => {
    const toast = { success: vi.fn(), error: vi.fn() };
    const onSuccess = vi.fn().mockResolvedValue(undefined);

    const handler = createValidatedHandler({
      run: () => ({ ok: true }),
      toast,
      successMessage: "done",
      onSuccess,
    });

    handler();
    await new Promise((r) => setTimeout(r, 10));

    expect(toast.success).toHaveBeenCalledWith("done");
  });

  it("handles async onSuccess that rejects", async () => {
    const toast = { success: vi.fn(), error: vi.fn() };
    const onSuccess = vi.fn().mockRejectedValue(new Error("callback failed"));

    const handler = createValidatedHandler({
      run: () => ({ ok: true }),
      toast,
      onSuccess,
      errorMessage: "fallback",
    });

    handler();
    await new Promise((r) => setTimeout(r, 10));

    expect(toast.error).toHaveBeenCalledWith("callback failed");
    expect(toast.success).not.toHaveBeenCalled();
  });
});
