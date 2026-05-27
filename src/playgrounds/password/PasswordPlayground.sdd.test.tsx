import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import { renderWithHistory } from "../../test-utils/renderWithHistory";

describe("PasswordPlayground", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders password input and generate button", () => {
    renderWithHistory();
    const input = screen.getByPlaceholderText(/Tu contraseña aparecerá aquí/i);
    const generateBtn = screen.getByRole("button", { name: /Generar/i });
    expect(input).toBeInTheDocument();
    expect(generateBtn).toBeInTheDocument();
  });

  it("generates a password when generate button is clicked", () => {
    const { generatePassword } = renderWithHistory();
    generatePassword();
    const input = screen.getByPlaceholderText(/Tu contraseña aparecerá aquí/i);
    expect(input).toHaveValue();
  });

  it("copies password to clipboard when copy button is clicked", () => {
    const { generatePassword } = renderWithHistory();
    generatePassword();
    const copyBtn = screen.getByRole("button", { name: /Copiar/i });
    const writeStub = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText: writeStub,
      },
    });
    act(() => {
      fireEvent.click(copyBtn);
    });
    expect(writeStub).toHaveBeenCalled();
  });

  it("keeps history of last 5 passwords", () => {
    const { generatePassword, getHistoryButtons } = renderWithHistory();
    for (let i = 0; i < 6; i++) {
      generatePassword();
    }
    expect(getHistoryButtons()).toHaveLength(5);
  });
});
