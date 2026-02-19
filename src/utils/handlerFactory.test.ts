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
});
