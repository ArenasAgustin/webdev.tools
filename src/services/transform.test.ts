import { describe, it, expect, vi } from "vitest";
import { createPlaygroundService, createNonEmptyValidator } from "./transform";

describe("createNonEmptyValidator", () => {
  const validator = createNonEmptyValidator(() => "El input está vacío");

  it("returns error for empty input", async () => {
    const result = await validator("   ");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("El input está vacío");
  });

  it("returns success for non-empty input", async () => {
    const result = await validator("hello");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBeUndefined();
  });
});

describe("createPlaygroundService", () => {
  const mockFormat = vi.fn();
  const mockMinify = vi.fn();

  const service = createPlaygroundService({
    format: mockFormat,
    minify: mockMinify,
    emptyMessage: "Vacío",
  });

  it("format returns value when ok", async () => {
    mockFormat.mockResolvedValue({ ok: true, value: "formatted" });
    const result = await service.format("input");
    expect(result).toEqual({ ok: true, value: "formatted" });
  });

  it("format returns error message when not ok", async () => {
    mockFormat.mockResolvedValue({ ok: false, error: { message: "parse error" } });
    const result = await service.format("bad input");
    expect(result).toEqual({ ok: false, error: "parse error" });
  });

  it("minify returns value when ok", async () => {
    mockMinify.mockResolvedValue({ ok: true, value: "minified" });
    const result = await service.minify("input");
    expect(result).toEqual({ ok: true, value: "minified" });
  });

  it("minify returns error message when not ok", async () => {
    mockMinify.mockResolvedValue({ ok: false, error: { message: "minify error" } });
    const result = await service.minify("bad");
    expect(result).toEqual({ ok: false, error: "minify error" });
  });

  it("uses default non-empty validator when validate is not provided", async () => {
    const result = await service.validate("   ");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Vacío");
  });

  it("uses default validator — returns ok for non-empty input", async () => {
    const result = await service.validate("something");
    expect(result.ok).toBe(true);
  });

  it("uses custom validate when provided", async () => {
    const customValidate = vi.fn().mockResolvedValue({ ok: false, error: "custom error" });
    const customService = createPlaygroundService({
      format: mockFormat,
      minify: mockMinify,
      emptyMessage: "Vacío",
      validate: customValidate,
    });
    const result = await customService.validate("anything");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("custom error");
  });
});
