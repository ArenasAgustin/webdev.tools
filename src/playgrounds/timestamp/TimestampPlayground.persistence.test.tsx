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
    TIMESTAMP_INPUT: "timestampInput",
    TIMESTAMP_TIMEZONE: "timestampTimezone",
  },
}));

vi.mock("@/hooks/useDebouncedValue", () => ({
  useDebouncedValue: <T,>(value: T) => value,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}));

vi.mock("@/components/common/SearchableSelect", () => ({
  SearchableSelect: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <select
      data-testid="timezone-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value={value}>{value}</option>
      <option value="Europe/London">Europe/London</option>
    </select>
  ),
}));

import { TimestampPlayground } from "./TimestampPlayground";

describe("TimestampPlayground persistence", () => {
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

  it("input and timezone are restored from storage on mount", () => {
    storedValues.timestampInput = "1700000000";
    storedValues.timestampTimezone = "Europe/London";
    getItemMock.mockImplementation((key: string) => storedValues[key] ?? null);

    render(<TimestampPlayground />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("1700000000");

    const timezoneSelect = screen.getByTestId("timezone-select");
    expect(timezoneSelect).toHaveValue("Europe/London");
  });

  it("result and error are NOT read from storage — they start as null/empty", () => {
    // Even if someone tried to store result/error, the component derives them
    storedValues.timestampInput = "invalid-timestamp-xyz";
    getItemMock.mockImplementation((key: string) => storedValues[key] ?? null);

    render(<TimestampPlayground />);

    // No results table should be visible since we haven't clicked Convert
    // (result starts null even though input is restored)
    const resultItems = screen.queryAllByRole("code");
    expect(resultItems).toHaveLength(0);
  });
});
