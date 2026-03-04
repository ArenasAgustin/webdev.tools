import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useHtmlParser } from "./useHtmlParser";
import { formatHtml } from "@/services/html/transform";

vi.mock("@/services/html/transform", () => ({
  formatHtml: vi.fn(),
}));

describe("useHtmlParser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns invalid with no error for empty input", () => {
    const { result } = renderHook(() => useHtmlParser("   "));

    expect(result.current.isValid).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("returns valid when formatHtml succeeds", async () => {
    vi.mocked(formatHtml).mockResolvedValue({ ok: true, value: "<div>ok</div>" });

    const { result } = renderHook(() => useHtmlParser("<div>ok</div>"));

    await waitFor(() => {
      expect(result.current.isValid).toBe(true);
      expect(result.current.error).toBeNull();
    });
  });

  it("returns invalid when formatHtml returns an error", async () => {
    vi.mocked(formatHtml).mockResolvedValue({ ok: false, error: "Etiqueta inválida" });

    const { result } = renderHook(() => useHtmlParser("<div"));

    await waitFor(() => {
      expect(result.current.isValid).toBe(false);
      expect(result.current.error?.message).toContain("Error de sintaxis");
      expect(result.current.error?.message).toContain("Etiqueta inválida");
    });
  });

  it("returns invalid when formatHtml throws", async () => {
    vi.mocked(formatHtml).mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useHtmlParser("<p>"));

    await waitFor(() => {
      expect(result.current.isValid).toBe(false);
      expect(result.current.error?.message).toContain("Error de sintaxis: boom");
    });
  });
});
