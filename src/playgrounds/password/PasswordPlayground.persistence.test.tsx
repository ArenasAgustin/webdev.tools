import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Storage mock — we capture what gets written to PASSWORD_OPTIONS
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
    PASSWORD_OPTIONS: "passwordOptions",
  },
}));

vi.mock("@/hooks/useDebouncedValue", () => ({
  useDebouncedValue: <T,>(value: T) => value,
}));

import { PasswordPlayground } from "./PasswordPlayground";
import { defaultPasswordOptions } from "./password.utils";

describe("PasswordPlayground persistence", () => {
  beforeEach(() => {
    // Clear stored values and mocks before each test
    Object.keys(storedValues).forEach((k) => delete storedValues[k]);
    getItemMock.mockClear();
    setItemMock.mockClear();
    // Reset mock implementations
    getItemMock.mockImplementation((key: string) => storedValues[key] ?? null);
    setItemMock.mockImplementation((key: string, value: unknown) => {
      storedValues[key] = value;
      return true;
    });
  });

  it("generated password NEVER appears in localStorage under PASSWORD_OPTIONS", () => {
    render(<PasswordPlayground />);

    const generateBtn = screen.getByRole("button", { name: /generar/i });
    fireEvent.click(generateBtn);

    // Check all calls to setItem for PASSWORD_OPTIONS key
    const passwordOptionsCalls = setItemMock.mock.calls.filter(
      ([key]) => key === "passwordOptions",
    );

    for (const [, value] of passwordOptionsCalls) {
      const serialized = JSON.stringify(value);
      // The stored options object must NOT contain a "password" field
      expect(serialized).not.toMatch(/"password"\s*:/);
    }
  });

  it("options are restored after remount", () => {
    // Pre-populate storage with custom options
    storedValues.passwordOptions = { ...defaultPasswordOptions, length: 20, includeSymbols: false };
    getItemMock.mockImplementation((key: string) => storedValues[key] ?? null);

    render(<PasswordPlayground />);

    // The slider should reflect length=20
    const slider = screen.getByRole("slider");
    expect(slider).toHaveValue("20");
  });

  it("merge-over-defaults: partial options in storage fills missing fields from defaults", () => {
    // Only partial options stored (missing some fields)
    storedValues.passwordOptions = { length: 32 };
    getItemMock.mockImplementation((key: string) => storedValues[key] ?? null);

    render(<PasswordPlayground />);

    // Length should be 32 (from storage)
    const slider = screen.getByRole("slider");
    expect(slider).toHaveValue("32");

    // Checkboxes order matches render: includeUppercase[0], includeLowercase[1], includeNumbers[2], includeSymbols[3]
    // includeLowercase default is true → must be checked even though it was absent from storage
    const checkboxes = screen.getAllByRole("checkbox");
    const lowercaseCheckbox = checkboxes[1]; // includeLowercase is the second checkbox
    expect(lowercaseCheckbox).toBeChecked();

    // includeSymbols default is false → must be unchecked
    const symbolsCheckbox = checkboxes[3]; // includeSymbols is the fourth checkbox
    expect(symbolsCheckbox).not.toBeChecked();
  });

  it("sensitive state is absent from storage (password, history, showPassword, copied)", () => {
    render(<PasswordPlayground />);

    const generateBtn = screen.getByRole("button", { name: /generar/i });
    fireEvent.click(generateBtn);

    const allStoredKeys = Object.keys(storedValues);
    const sensitiveKeys = ["password", "history", "showPassword", "copied"];

    for (const sensitive of sensitiveKeys) {
      expect(allStoredKeys).not.toContain(sensitive);
    }

    // Also verify no PASSWORD_OPTIONS value contains those fields
    const passwordOptionsValue = storedValues.passwordOptions;
    if (passwordOptionsValue) {
      const serialized = JSON.stringify(passwordOptionsValue);
      for (const sensitive of sensitiveKeys) {
        expect(serialized).not.toMatch(new RegExp(`"${sensitive}"\\s*:`));
      }
    }
  });
});
