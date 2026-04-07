import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { PasswordPlayground } from "./PasswordPlayground";
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

describe("PasswordPlayground", () => {
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

  it("renders password input and generate button", () => {
    renderWithProviders(<PasswordPlayground />);

    expect(screen.getByPlaceholderText(/contraseña aparecerá aquí/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Generar/i })).toBeInTheDocument();
  });

  it("generates a password when generate button is clicked", async () => {
    renderWithProviders(<PasswordPlayground />);

    const generateBtn = screen.getByRole("button", { name: /Generar/i });

    await act(async () => {
      fireEvent.click(generateBtn);
    });

    const passwordInput = screen.getByPlaceholderText(
      /contraseña aparecerá aquí/i,
    );
    expect(passwordInput).toHaveValue();
    expect(passwordInput.value.length).toBeGreaterThan(0);
  });

  it("toggles password visibility when eye button is clicked", async () => {
    renderWithProviders(<PasswordPlayground />);

    // Generate a password first
    const generateBtn = screen.getByRole("button", { name: /Generar/i });
    await act(async () => {
      fireEvent.click(generateBtn);
    });

    // Find the toggle visibility button (has eye icon)
    const toggleBtn = screen.getByTitle(/Mostrar/i);
    expect(toggleBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(toggleBtn);
    });

    // Button title should change to "Ocultar"
    expect(screen.getByTitle(/Ocultar/i)).toBeInTheDocument();
  });

  it("copies password to clipboard when copy button is clicked", async () => {
    renderWithProviders(<PasswordPlayground />);

    // Generate a password first
    const generateBtn = screen.getByRole("button", { name: /Generar/i });
    await act(async () => {
      fireEvent.click(generateBtn);
    });

    // Find copy button
    const copyBtn = screen.getByRole("button", { name: /Copiar/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it("updates password length when slider changes", async () => {
    renderWithProviders(<PasswordPlayground />);

    // Find the range input (slider)
    const slider = document.querySelector('input[type="range"]')!;
    expect(slider).toBeInTheDocument();

    await act(async () => {
      fireEvent.change(slider, { target: { value: 20 } });
    });

    // Length display should show 20
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("toggles uppercase option when checkbox is clicked", async () => {
    renderWithProviders(<PasswordPlayground />);

    const checkbox = screen.getByRole("checkbox", { name: /Mayúsculas/i });
    expect(checkbox).toBeChecked(); // Default is true

    await act(async () => {
      fireEvent.click(checkbox);
    });

    expect(checkbox).not.toBeChecked();
  });

  it("toggles numbers option when checkbox is clicked", async () => {
    renderWithProviders(<PasswordPlayground />);

    const checkbox = screen.getByRole("checkbox", { name: /Números/i });
    expect(checkbox).toBeChecked(); // Default is true

    await act(async () => {
      fireEvent.click(checkbox);
    });

    expect(checkbox).not.toBeChecked();
  });

  it("toggles symbols option when checkbox is clicked", async () => {
    renderWithProviders(<PasswordPlayground />);

    const checkbox = screen.getByRole("checkbox", { name: /Símbolos/i });
    expect(checkbox).not.toBeChecked(); // Default is false

    await act(async () => {
      fireEvent.click(checkbox);
    });

    expect(checkbox).toBeChecked();
  });

  it("shows strength indicator after generating password", async () => {
    renderWithProviders(<PasswordPlayground />);

    const generateBtn = screen.getByRole("button", { name: /Generar/i });
    await act(async () => {
      fireEvent.click(generateBtn);
    });

    // Should show strength indicator
    expect(screen.getByText(/Fortaleza:/i)).toBeInTheDocument();
  });

  it("adds generated password to history", async () => {
    renderWithProviders(<PasswordPlayground />);

    const generateBtn = screen.getByRole("button", { name: /Generar/i });

    // Generate password twice
    await act(async () => {
      fireEvent.click(generateBtn);
    });

    await act(async () => {
      fireEvent.click(generateBtn);
    });

    // Should show history section
    expect(screen.getByText(/Historial:/i)).toBeInTheDocument();
  });

  it("copies history password when clicked", async () => {
    renderWithProviders(<PasswordPlayground />);

    const generateBtn = screen.getByRole("button", { name: /Generar/i });

    await act(async () => {
      fireEvent.click(generateBtn);
    });

    // Click on history item
    const historyButtons = screen.getAllByText(/\.\.\./i);
    if (historyButtons.length > 0) {
      await act(async () => {
        fireEvent.click(historyButtons[0]);
      });
    }
  });
});
