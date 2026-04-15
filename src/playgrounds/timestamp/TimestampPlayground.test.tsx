import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { TimestampPlayground } from "./TimestampPlayground";
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

describe("TimestampPlayground", () => {
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

  it("renders with example timestamp", () => {
    renderWithProviders(<TimestampPlayground />);

    expect(screen.getByPlaceholderText(/Unix timestamp o fecha/i)).toBeInTheDocument();
  });

  it("renders convert button", () => {
    renderWithProviders(<TimestampPlayground />);

    expect(screen.getByRole("button", { name: /Convertir/i })).toBeInTheDocument();
  });

  it("renders now button", () => {
    renderWithProviders(<TimestampPlayground />);

    expect(screen.getByRole("button", { name: /Ahora/i })).toBeInTheDocument();
  });

  it("renders clear button", () => {
    renderWithProviders(<TimestampPlayground />);

    expect(screen.getByRole("button", { name: /Limpiar/i })).toBeInTheDocument();
  });

  it("renders timezone selector", () => {
    renderWithProviders(<TimestampPlayground />);

    expect(screen.getByText(/Zona horaria:/i)).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("converts valid timestamp when convert button is clicked", async () => {
    renderWithProviders(<TimestampPlayground />);

    const input = screen.getByPlaceholderText(/Unix timestamp o fecha/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "1704067200" } });
    });

    const convertBtn = screen.getByRole("button", { name: /Convertir/i });
    await act(async () => {
      fireEvent.click(convertBtn);
    });

    // Should show results - check for Unix (s) which is unique
    expect(screen.getAllByText(/Unix/i).length).toBeGreaterThan(0);
  });

  it("shows current timestamp when now button is clicked", async () => {
    renderWithProviders(<TimestampPlayground />);

    const nowBtn = screen.getByRole("button", { name: /Ahora/i });
    await act(async () => {
      fireEvent.click(nowBtn);
    });

    // Should show results
    expect(screen.getAllByText(/Unix/i).length).toBeGreaterThan(0);
  });

  it("clears input when clear button is clicked", async () => {
    renderWithProviders(<TimestampPlayground />);

    const input = screen.getByPlaceholderText(/Unix timestamp o fecha/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "1704067200" } });
    });

    const clearBtn = screen.getByRole("button", { name: /Limpiar/i });
    await act(async () => {
      fireEvent.click(clearBtn);
    });

    expect(input).toHaveValue("");
  });

  it("shows error for invalid timestamp", async () => {
    renderWithProviders(<TimestampPlayground />);

    const input = screen.getByPlaceholderText(/Unix timestamp o fecha/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "invalid-timestamp" } });
    });

    const convertBtn = screen.getByRole("button", { name: /Convertir/i });
    await act(async () => {
      fireEvent.click(convertBtn);
    });

    expect(screen.getByText(/Input inválido/i)).toBeInTheDocument();
  });

  it("changes timezone when select changes", async () => {
    renderWithProviders(<TimestampPlayground />);

    const select = screen.getByRole("combobox");
    await act(async () => {
      fireEvent.change(select, { target: { value: "America/New_York" } });
    });

    expect(select).toHaveValue("America/New_York");
  });

  it("copies value to clipboard when copy button is clicked", async () => {
    renderWithProviders(<TimestampPlayground />);

    // First convert a timestamp
    const input = screen.getByPlaceholderText(/Unix timestamp o fecha/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "1704067200" } });
    });

    const convertBtn = screen.getByRole("button", { name: /Convertir/i });
    await act(async () => {
      fireEvent.click(convertBtn);
    });

    // Click copy button
    const copyButtons = screen.getAllByRole("button", { name: /Copiar/i });
    await act(async () => {
      fireEvent.click(copyButtons[0]);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it("converts timestamp on Enter key press", async () => {
    renderWithProviders(<TimestampPlayground />);

    const input = screen.getByPlaceholderText(/Unix timestamp o fecha/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "1704067200" } });
    });

    await act(async () => {
      fireEvent.keyDown(input, { key: "Enter" });
    });

    // Should show results
    expect(screen.getAllByText(/Unix/i).length).toBeGreaterThan(0);
  });

  it("shows future indicator for future timestamps", async () => {
    renderWithProviders(<TimestampPlayground />);

    // Use a future timestamp
    const input = screen.getByPlaceholderText(/Unix timestamp o fecha/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "2000000000" } });
    });

    const convertBtn = screen.getByRole("button", { name: /Convertir/i });
    await act(async () => {
      fireEvent.click(convertBtn);
    });

    expect(screen.getByText(/en el futuro/i)).toBeInTheDocument();
  });
});
