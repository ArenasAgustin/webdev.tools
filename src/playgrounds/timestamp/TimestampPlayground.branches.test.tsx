import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

const {
  getItemMock,
  setItemMock,
  toastSuccessMock,
  toastErrorMock,
  clipboardWriteTextMock,
} = vi.hoisted(() => ({
  getItemMock: vi.fn(() => null),
  setItemMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
  clipboardWriteTextMock: vi.fn(),
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
    t: (k: string) => k,
  }),
}));

vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({
    success: toastSuccessMock,
    error: toastErrorMock,
    info: vi.fn(),
  }),
}));

// Mock SearchableSelect — renders a simple select that calls onChange
vi.mock("@/components/common/SearchableSelect", () => ({
  SearchableSelect: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
    options: string[];
    placeholder?: string;
    noResultsLabel?: string;
  }) => (
    <select
      data-testid="timezone-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="UTC">UTC</option>
      <option value="America/Argentina/Buenos_Aires">America/Argentina/Buenos_Aires</option>
      <option value="Europe/London">Europe/London</option>
    </select>
  ),
}));

import { TimestampPlayground } from "./TimestampPlayground";

describe("TimestampPlayground branches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: clipboardWriteTextMock },
    });
    clipboardWriteTextMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("handleConvert: empty input clears result without error", () => {
    render(<TimestampPlayground />);

    const input = screen.getByPlaceholderText("timestamp.placeholder");
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /timestamp\.convert/i }));

    // No result rows, no error message
    expect(screen.queryByText(/timestamp\.invalidInput/i)).not.toBeInTheDocument();
  });

  it("handleConvert: valid unix timestamp shows result rows", () => {
    render(<TimestampPlayground />);

    const input = screen.getByPlaceholderText("timestamp.placeholder");
    // Unix timestamp for 2024-01-01 00:00:00 UTC
    fireEvent.change(input, { target: { value: "1704067200" } });
    fireEvent.click(screen.getByRole("button", { name: /timestamp\.convert/i }));

    // Result rows labelled by format keys (identity t() mock)
    expect(screen.getByText("timestamp.formats.iso8601")).toBeInTheDocument();
    expect(screen.getByText("timestamp.formats.unixSeconds")).toBeInTheDocument();
  });

  it("handleConvert: invalid input shows error message", () => {
    render(<TimestampPlayground />);

    const input = screen.getByPlaceholderText("timestamp.placeholder");
    fireEvent.change(input, { target: { value: "not-a-date-or-timestamp" } });
    fireEvent.click(screen.getByRole("button", { name: /timestamp\.convert/i }));

    expect(screen.getByText("timestamp.invalidInput")).toBeInTheDocument();
  });

  it("handleNow: populates input with current unix timestamp and converts", () => {
    render(<TimestampPlayground />);

    const input = screen.getByPlaceholderText("timestamp.placeholder");
    // Note: default value is timestampConfig.example ("1712160000"), not empty

    fireEvent.click(screen.getByRole("button", { name: /timestamp\.now/i }));

    // Input should now contain a numeric timestamp (current time)
    const value = (input as HTMLInputElement).value;
    expect(Number(value)).toBeGreaterThan(0);

    // And result rows should appear
    expect(screen.getByText("timestamp.formats.unixSeconds")).toBeInTheDocument();
  });

  it("handleClear: resets input, result and error", () => {
    render(<TimestampPlayground />);

    const input = screen.getByPlaceholderText("timestamp.placeholder");
    fireEvent.change(input, { target: { value: "1704067200" } });
    fireEvent.click(screen.getByRole("button", { name: /timestamp\.convert/i }));
    expect(screen.getByText("timestamp.formats.unixSeconds")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /common\.clear/i }));

    expect((input as HTMLInputElement).value).toBe("");
    expect(screen.queryByText("timestamp.formats.unixSeconds")).not.toBeInTheDocument();
    expect(screen.queryByText("timestamp.invalidInput")).not.toBeInTheDocument();
  });

  it("isFuture banner is shown for future dates", () => {
    render(<TimestampPlayground />);

    const input = screen.getByPlaceholderText("timestamp.placeholder");
    // Unix timestamp far in the future: year 2100
    fireEvent.change(input, { target: { value: "4102444800" } });
    fireEvent.click(screen.getByRole("button", { name: /timestamp\.convert/i }));

    expect(screen.getByText(/timestamp\.futureDate/i)).toBeInTheDocument();
  });

  it("clipboard copy: calls toast.success on success", async () => {
    render(<TimestampPlayground />);

    const input = screen.getByPlaceholderText("timestamp.placeholder");
    fireEvent.change(input, { target: { value: "1704067200" } });
    fireEvent.click(screen.getByRole("button", { name: /timestamp\.convert/i }));

    const copyButtons = screen.getAllByRole("button", { name: /common\.copy/i });
    await act(async () => {
      fireEvent.click(copyButtons[0]);
    });

    expect(clipboardWriteTextMock).toHaveBeenCalled();
    expect(toastSuccessMock).toHaveBeenCalledWith("timestamp.copied");
  });

  it("clipboard copy: calls toast.error on failure", async () => {
    clipboardWriteTextMock.mockRejectedValueOnce(new Error("denied"));

    render(<TimestampPlayground />);

    const input = screen.getByPlaceholderText("timestamp.placeholder");
    fireEvent.change(input, { target: { value: "1704067200" } });
    fireEvent.click(screen.getByRole("button", { name: /timestamp\.convert/i }));

    const copyButtons = screen.getAllByRole("button", { name: /common\.copy/i });
    await act(async () => {
      fireEvent.click(copyButtons[0]);
    });

    expect(toastErrorMock).toHaveBeenCalledWith("common.copy");
  });

  it("Enter key on input fires handleConvert", () => {
    render(<TimestampPlayground />);

    const input = screen.getByPlaceholderText("timestamp.placeholder");
    fireEvent.change(input, { target: { value: "1704067200" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getByText("timestamp.formats.unixSeconds")).toBeInTheDocument();
  });

  it("timezone change via SearchableSelect updates conversion", () => {
    render(<TimestampPlayground />);

    const input = screen.getByPlaceholderText("timestamp.placeholder");
    fireEvent.change(input, { target: { value: "1704067200" } });
    fireEvent.click(screen.getByRole("button", { name: /timestamp\.convert/i }));

    // Change timezone
    const select = screen.getByTestId("timezone-select");
    fireEvent.change(select, { target: { value: "Europe/London" } });

    // Convert again to apply new timezone
    fireEvent.click(screen.getByRole("button", { name: /timestamp\.convert/i }));

    // Component still renders correctly with the new timezone
    expect(screen.getByText("timestamp.formats.humanReadable")).toBeInTheDocument();
  });
});
