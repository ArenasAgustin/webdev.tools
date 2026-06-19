import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const storedValues: Record<string, unknown> = {};

const { getItemMock, setItemMock } = vi.hoisted(() => ({
  getItemMock: vi.fn((key: string) => storedValues[key] ?? null),
  setItemMock: vi.fn((key: string, value: unknown) => {
    storedValues[key] = value;
    return true;
  }),
}));

vi.mock("@/services/storage", () => ({
  getItem: getItemMock,
  setItem: setItemMock,
  STORAGE_KEYS: {
    COLORS_INPUT: "colorsInput",
  },
}));

vi.mock("@/hooks/useDebouncedValue", () => ({
  useDebouncedValue: <T,>(value: T) => value,
}));

// Mock HexColorPicker to avoid canvas dependencies
vi.mock("react-colorful", () => ({
  HexColorPicker: ({ color }: { color: string }) => (
    <div data-testid="color-picker" data-color={color} />
  ),
}));

import { ColorsPlayground } from "./ColorsPlayground";

describe("ColorsPlayground persistence", () => {
  beforeEach(() => {
    Object.keys(storedValues).forEach((k) => delete storedValues[k]);
    getItemMock.mockClear();
    setItemMock.mockClear();
    getItemMock.mockImplementation((key: string) => storedValues[key] ?? null);
    setItemMock.mockImplementation((key: string, value: unknown) => {
      storedValues[key] = value;
      return true;
    });
  });

  it("input is restored from storage; color is re-derived from input (not from a separate key)", () => {
    storedValues.colorsInput = "rgb(255, 0, 0)";
    getItemMock.mockImplementation((key: string) => storedValues[key] ?? null);

    render(<ColorsPlayground />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("rgb(255, 0, 0)");

    // Color picker should reflect the derived hex for red, not the default #3498db
    const picker = screen.getByTestId("color-picker");
    expect(picker.dataset.color).not.toBe("#3498db");
    expect(picker.dataset.color?.toLowerCase()).toBe("#ff0000");
  });

  it("invalid stored input falls back to default color #3498db without throwing", () => {
    storedValues.colorsInput = "not-a-valid-color-!!";
    getItemMock.mockImplementation((key: string) => storedValues[key] ?? null);

    // Should not throw
    expect(() => render(<ColorsPlayground />)).not.toThrow();

    const picker = screen.getByTestId("color-picker");
    expect(picker.dataset.color).toBe("#3498db");
  });
});
