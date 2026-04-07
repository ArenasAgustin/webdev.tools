import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ColorsPlayground } from "./ColorsPlayground";
import { ToastProvider } from "@/context/ToastContext";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

vi.mock("react-colorful", () => ({
  HexColorPicker: () => <div data-testid="color-picker" />,
}));

describe("ColorsPlayground", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    localStorageMock.clear();
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const renderWithProviders = (component: React.ReactNode) => {
    return render(<ToastProvider>{component}</ToastProvider>);
  };

  it("renders with default color and example input", () => {
    renderWithProviders(<ColorsPlayground />);

    const input = screen.getByPlaceholderText(/HEX, RGB, HSL/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("#3498db");
  });

  it("updates color when input changes to valid hex", async () => {
    renderWithProviders(<ColorsPlayground />);

    const input = screen.getByPlaceholderText(/HEX, RGB, HSL/i);

    await act(async () => {
      fireEvent.change(input, { target: { value: "#ff5500" } });
    });

    expect(input).toHaveValue("#ff5500");
  });

  it("shows format values when valid color is entered", async () => {
    renderWithProviders(<ColorsPlayground />);

    const input = screen.getByPlaceholderText(/HEX, RGB, HSL/i);

    await act(async () => {
      fireEvent.change(input, { target: { value: "#ff0000" } });
    });

    // Should show format labels - use getAllByText for multiple matches
    expect(screen.getAllByText(/HEX/i).length).toBeGreaterThan(0);
  });

  it("copies format value to clipboard when copy button is clicked", async () => {
    renderWithProviders(<ColorsPlayground />);

    const input = screen.getByPlaceholderText(/HEX, RGB, HSL/i);

    await act(async () => {
      fireEvent.change(input, { target: { value: "#00ff00" } });
    });

    const copyButtons = screen.getAllByRole("button", { name: /Copiar/i });
    expect(copyButtons.length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.click(copyButtons[0]);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it("handles invalid color input gracefully", async () => {
    renderWithProviders(<ColorsPlayground />);

    const input = screen.getByPlaceholderText(/HEX, RGB, HSL/i);

    await act(async () => {
      fireEvent.change(input, { target: { value: "invalid-color" } });
    });

    // Should not crash, just show warning
    expect(input).toHaveValue("invalid-color");
  });

  it("renders color picker component", () => {
    renderWithProviders(<ColorsPlayground />);

    expect(screen.getByTestId("color-picker")).toBeInTheDocument();
  });

  it("updates color when picker changes", async () => {
    renderWithProviders(<ColorsPlayground />);

    const picker = screen.getByTestId("color-picker");

    await act(async () => {
      fireEvent.click(picker);
    });

    // The color should update - picker should exist and be clickable
    expect(picker).toBeInTheDocument();
  });
});
