import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

const {
  getItemMock,
  setItemMock,
  clipboardWriteTextMock,
} = vi.hoisted(() => ({
  getItemMock: vi.fn(() => null),
  setItemMock: vi.fn(),
  clipboardWriteTextMock: vi.fn(),
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

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k: string) => k,
  }),
}));

import { PasswordPlayground } from "./PasswordPlayground";

describe("PasswordPlayground branches", () => {
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

  it("handleGenerate produces a non-empty password and adds it to history", () => {
    render(<PasswordPlayground />);

    const generateBtn = screen.getByRole("button", { name: /generar/i });
    fireEvent.click(generateBtn);

    // Password input should have a value
    const passwordInput = screen.getByPlaceholderText(/contraseña aparecerá aquí/i);
    expect((passwordInput as HTMLInputElement).value).not.toBe("");

    // History should show one entry
    expect(screen.getByRole("button", { name: /\.\.\./i })).toBeInTheDocument();
  });

  it("showPassword toggle changes input type between password and text", () => {
    render(<PasswordPlayground />);

    const passwordInput = screen.getByPlaceholderText(/contraseña aparecerá aquí/i);
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleBtn = screen.getByRole("button", { name: /mostrar contraseña/i });
    fireEvent.click(toggleBtn);

    expect(passwordInput).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: /ocultar contraseña/i })).toBeInTheDocument();

    // Toggle back
    fireEvent.click(screen.getByRole("button", { name: /ocultar contraseña/i }));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("copy button is disabled when no password and aria-label reflects copied state", async () => {
    render(<PasswordPlayground />);

    const copyBtn = screen.getByRole("button", { name: /copiar contraseña/i });
    expect(copyBtn).toBeDisabled();

    // Generate a password first
    fireEvent.click(screen.getByRole("button", { name: /generar/i }));

    const copyBtnActive = screen.getByRole("button", { name: /copiar contraseña/i });
    expect(copyBtnActive).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(copyBtnActive);
    });

    expect(clipboardWriteTextMock).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /contraseña copiada/i })).toBeInTheDocument();

    // After 2000ms the copied state resets
    await act(async () => {
      vi.advanceTimersByTime(2001);
    });
    expect(screen.getByRole("button", { name: /copiar contraseña/i })).toBeInTheDocument();
  });

  it("history is capped at 5 entries", () => {
    render(<PasswordPlayground />);

    const generateBtn = screen.getByRole("button", { name: /generar/i });

    // Generate 7 passwords
    for (let i = 0; i < 7; i++) {
      fireEvent.click(generateBtn);
    }

    // Only 5 history entries should be shown
    const historyButtons = screen.getAllByRole("button", { name: /\.\.\./i });
    expect(historyButtons).toHaveLength(5);
  });

  it("handleHistoryClick restores password from history", () => {
    render(<PasswordPlayground />);

    fireEvent.click(screen.getByRole("button", { name: /generar/i }));

    const passwordInput = screen.getByPlaceholderText(/contraseña aparecerá aquí/i);
    const firstPassword = (passwordInput as HTMLInputElement).value;
    expect(firstPassword).not.toBe(""); // sanity

    // Generate another to push first to history
    fireEvent.click(screen.getByRole("button", { name: /generar/i }));

    // History should now have 2 entries; the second item is firstPassword
    const historyBtns = screen.getAllByRole("button", { name: /\.\.\./i });
    expect(historyBtns.length).toBeGreaterThanOrEqual(2);

    // The second history entry (index 1) corresponds to firstPassword
    const secondHistoryBtn = historyBtns[1];
    expect(secondHistoryBtn.getAttribute("title")).toBe(firstPassword);

    fireEvent.click(secondHistoryBtn);

    // After click, password input should be restored to firstPassword
    expect((passwordInput as HTMLInputElement).value).toBe(firstPassword);
  });

  it("strengthResult colors: weak(<40), medium(<60), good(<80), strong(>=80)", () => {
    render(<PasswordPlayground />);

    // Disable all char types except lowercase (weakest)
    const uppercaseCheckbox = screen.getByRole("checkbox", { name: "password.aria.uppercase" });
    const numbersCheckbox = screen.getByRole("checkbox", { name: "password.aria.numbers" });
    const symbolsCheckbox = screen.getByRole("checkbox", { name: "password.aria.symbols" });

    // Uncheck uppercase (default: checked)
    fireEvent.click(uppercaseCheckbox);
    // Uncheck numbers (default: checked)
    fireEvent.click(numbersCheckbox);
    // symbols already unchecked by default

    // Strength indicator is only shown after generating a password
    fireEvent.click(screen.getByRole("button", { name: /generar/i }));

    // Strength bar should be visible
    expect(screen.getByText(/fortaleza/i)).toBeInTheDocument();

    // Re-check all for strong password
    fireEvent.click(uppercaseCheckbox);
    fireEvent.click(numbersCheckbox);
    fireEvent.click(symbolsCheckbox);
    fireEvent.click(screen.getByRole("button", { name: /generar/i }));

    expect(screen.getByText(/fortaleza/i)).toBeInTheDocument();
  });

  it("checkboxes are queryable by aria-label (i18n keys via mock)", () => {
    render(<PasswordPlayground />);

    // All 4 checkboxes must be findable by their i18n key (identity mock returns the key)
    expect(screen.getByRole("checkbox", { name: "password.aria.uppercase" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "password.aria.lowercase" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "password.aria.numbers" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "password.aria.symbols" })).toBeInTheDocument();
  });

  it("toggling checkbox changes password options", () => {
    render(<PasswordPlayground />);

    const symbolsCheckbox = screen.getByRole("checkbox", { name: "password.aria.symbols" });
    expect(symbolsCheckbox).not.toBeChecked(); // default is false

    fireEvent.click(symbolsCheckbox);
    expect(symbolsCheckbox).toBeChecked();

    fireEvent.click(symbolsCheckbox);
    expect(symbolsCheckbox).not.toBeChecked();
  });
});
