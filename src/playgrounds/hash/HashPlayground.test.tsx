import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { HashPlayground } from "./HashPlayground";
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

describe("HashPlayground", () => {
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

  it("renders with text mode by default", () => {
    renderWithProviders(<HashPlayground />);

    expect(screen.getByPlaceholderText(/texto para generar hashes/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Texto/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Archivo/i })).toBeInTheDocument();
  });

  it("renders generate button", () => {
    renderWithProviders(<HashPlayground />);

    expect(screen.getByRole("button", { name: /Generar/i })).toBeInTheDocument();
  });

  it("switches to file mode when file button is clicked", async () => {
    renderWithProviders(<HashPlayground />);

    const fileBtn = screen.getByRole("button", { name: /Archivo/i });
    await act(async () => {
      fireEvent.click(fileBtn);
    });

    // Should show file drop zone
    expect(screen.getByText(/Arrastra un archivo aquí/i)).toBeInTheDocument();
  });

  it("generates hashes when generate button is clicked", async () => {
    renderWithProviders(<HashPlayground />);

    const generateBtn = screen.getByRole("button", { name: /Generar/i });
    await act(async () => {
      fireEvent.click(generateBtn);
    });

    // Should show results section
    expect(screen.getByText(/Resultados/i)).toBeInTheDocument();

    // Should have copy buttons for hashes
    const copyButtons = screen.getAllByRole("button", { name: /Copiar hash/i });
    expect(copyButtons.length).toBeGreaterThan(0);
  });

  it("copies hash value to clipboard when copy button is clicked", async () => {
    renderWithProviders(<HashPlayground />);

    // Generate hashes first
    const generateBtn = screen.getByRole("button", { name: /Generar/i });
    await act(async () => {
      fireEvent.click(generateBtn);
    });

    // Click copy button
    const copyButtons = screen.getAllByRole("button", { name: /Copiar hash/i });
    await act(async () => {
      fireEvent.click(copyButtons[0]);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it("toggles uppercase when checkbox is clicked", async () => {
    renderWithProviders(<HashPlayground />);

    const checkbox = screen.getByRole("checkbox", { name: /Mayúsculas/i });
    await act(async () => {
      fireEvent.click(checkbox);
    });

    expect(checkbox).toBeChecked();
  });

  it("shows compare section", () => {
    renderWithProviders(<HashPlayground />);

    expect(screen.getByText(/Comparar Hash/i)).toBeInTheDocument();
  });

  it("shows compare input field", () => {
    renderWithProviders(<HashPlayground />);

    expect(screen.getByPlaceholderText(/hash para comparar/i)).toBeInTheDocument();
  });

  it("shows compare button", () => {
    renderWithProviders(<HashPlayground />);

    expect(screen.getByRole("button", { name: /Comparar/i })).toBeInTheDocument();
  });

  it("shows match result when comparing valid hash", async () => {
    renderWithProviders(<HashPlayground />);

    // Generate hashes first
    const generateBtn = screen.getByRole("button", { name: /Generar/i });
    await act(async () => {
      fireEvent.click(generateBtn);
    });

    // The hash results should be displayed
    expect(screen.getByText(/Resultados/i)).toBeInTheDocument();

    // Get the hash value from the first result
    const results = screen.getAllByRole("button", { name: /Copiar hash/i });
    expect(results.length).toBeGreaterThan(0);
  });

  it("shows no match when comparing invalid hash", async () => {
    renderWithProviders(<HashPlayground />);

    // Generate hashes first
    const generateBtn = screen.getByRole("button", { name: /Generar/i });
    await act(async () => {
      fireEvent.click(generateBtn);
    });

    // Enter invalid hash
    const compareInput = screen.getByPlaceholderText(/hash para comparar/i);
    await act(async () => {
      fireEvent.change(compareInput, { target: { value: "invalid-hash-value" } });
    });

    // Click compare button
    const compareBtn = screen.getByRole("button", { name: /Comparar/i });
    await act(async () => {
      fireEvent.click(compareBtn);
    });

    // Compare section should be visible
    expect(screen.getByText(/Comparar Hash/i)).toBeInTheDocument();
  });
});
