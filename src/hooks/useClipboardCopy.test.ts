import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useClipboardCopy } from "./useClipboardCopy";

describe("useClipboardCopy", () => {
  const writeText = vi.fn<(text: string) => Promise<void>>();
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    writeText.mockReset();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    warnSpy.mockRestore();
  });

  it("starts idle", () => {
    const { result } = renderHook(() => useClipboardCopy());

    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBe(false);
  });

  it("returns true and sets copied on success, then resets after 2000ms", async () => {
    writeText.mockResolvedValue(undefined);
    const { result } = renderHook(() => useClipboardCopy());

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.copy("hello");
    });

    expect(ok).toBe(true);
    expect(writeText).toHaveBeenCalledWith("hello");
    expect(result.current.copied).toBe(true);
    expect(result.current.error).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.copied).toBe(false);
  });

  it("returns false, warns and sets error on failure, then resets after 2000ms", async () => {
    const err = new Error("denied");
    writeText.mockRejectedValue(err);
    const { result } = renderHook(() => useClipboardCopy());

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.copy("hello");
    });

    expect(ok).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith("Clipboard write failed:", err);
    expect(result.current.error).toBe(true);
    expect(result.current.copied).toBe(false);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.error).toBe(false);
  });

  it("clears copied when a later copy fails", async () => {
    writeText.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error("denied"));
    const { result } = renderHook(() => useClipboardCopy());

    await act(async () => {
      await result.current.copy("a");
    });
    expect(result.current.copied).toBe(true);

    await act(async () => {
      await result.current.copy("b");
    });
    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBe(true);
  });

  it("restarts the reset timer on re-trigger", async () => {
    writeText.mockResolvedValue(undefined);
    const { result } = renderHook(() => useClipboardCopy());

    await act(async () => {
      await result.current.copy("a");
    });
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    await act(async () => {
      await result.current.copy("b");
    });
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.copied).toBe(false);
  });

  it("honors a custom resetMs", async () => {
    writeText.mockResolvedValue(undefined);
    const { result } = renderHook(() => useClipboardCopy({ resetMs: 500 }));

    await act(async () => {
      await result.current.copy("a");
    });
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.copied).toBe(false);
  });

  it("reset clears flags and the pending timer", async () => {
    writeText.mockResolvedValue(undefined);
    const { result } = renderHook(() => useClipboardCopy());

    await act(async () => {
      await result.current.copy("a");
    });
    act(() => {
      result.current.reset();
    });

    expect(result.current.copied).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("clears the pending timer on unmount", async () => {
    writeText.mockResolvedValue(undefined);
    const { result, unmount } = renderHook(() => useClipboardCopy());

    await act(async () => {
      await result.current.copy("a");
    });
    expect(vi.getTimerCount()).toBe(1);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps copy and reset identities stable across rerenders", async () => {
    writeText.mockResolvedValue(undefined);
    const { result, rerender } = renderHook(() => useClipboardCopy());
    const { copy, reset } = result.current;

    await act(async () => {
      await result.current.copy("a");
    });
    rerender();

    expect(result.current.copy).toBe(copy);
    expect(result.current.reset).toBe(reset);
  });
});
