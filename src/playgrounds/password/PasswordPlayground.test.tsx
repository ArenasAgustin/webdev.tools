import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { PasswordPlayground } from "./PasswordPlayground";
import { ToastProvider } from "@/context/ToastContext";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";

interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  length: number;
  key(index: number): string | null;
}

// Configuración de i18n para tests
const initI18n = async () => {
  // Limpiar estado previo de i18n
  await i18n.changeLanguage("es"); // Cambiar a un idioma inexistente para forzar limpieza
  i18n.services.resourceStore.data = {};
  i18n.store.data = {};
  i18n.isInitialized = false;

  await i18n.use(initReactI18next).init({
    lng: "es",
    fallbackLng: "es",
    interpolation: {
      escapeValue: false,
    },
    resources: {
      es: {
        translation: {
          "password.placeholder": "contraseña aparecerá aquí",
          "password.generate": "Generar",
          "password.copy": "Copiar",
          "password.show": "Mostrar",
          "password.hide": "Ocultar",
          "password.strength": "Fortaleza:",
          "password.history": "Historial:",
          "password.uppercase": "Mayúsculas",
          "password.numbers": "Números",
          "password.symbols": "Símbolos",
        },
      },
    },
  });
};

const renderWithI18n = async (component: React.ReactNode) => {
  await initI18n();
  const result = {
    ...render(
      <I18nextProvider i18n={i18n}>{component}</I18nextProvider>
    ),
  };
  return result;
};

// Limpiar i18n después de cada test
afterEach(async () => {
  await i18n.changeLanguage("es"); // Cambiar a un idioma inexistente para forzar limpieza
  i18n.services.resourceStore.data = {};
  i18n.store.data = {};
  i18n.isInitialized = false;
});

const localStorageMock: Storage = (() => {
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
    length: 0,
    key: () => null,
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

const renderWithProviders = async (component: React.ReactNode) => {
  return await renderWithI18n(<ToastProvider>{component}</ToastProvider>);
};

  it("renders password input and generate button", async () => {
    await renderWithProviders(<PasswordPlayground />);

    expect(screen.getByPlaceholderText(/contraseña aparecerá aquí/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Generar/i })).toBeInTheDocument();
  });

  it("generates a password when generate button is clicked", async () => {
    await renderWithProviders(<PasswordPlayground />);

    const generateBtn = screen.getByRole("button", { name: /Generar/i });

    await act(async () => {
      fireEvent.click(generateBtn);
    });

    const passwordInput = screen.getByPlaceholderText(/contraseña aparecerá aquí/i);
    expect(passwordInput).toHaveValue();
  });

  it("toggles password visibility when eye button is clicked", async () => {
    await renderWithProviders(<PasswordPlayground />);

    // Generate a password first
    const generateBtn = screen.getByRole("button", { name: /Generar/i });
    await act(async () => {
      fireEvent.click(generateBtn);
    });

    // Find the toggle visibility button (starts with "Mostrar" label)
    const toggleBtn = screen.getByLabelText(/Mostrar/i);
    expect(toggleBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(toggleBtn);
    });

    // Button label should change to "Ocultar"
    expect(screen.getByLabelText(/Ocultar/i)).toBeInTheDocument();
  });

  it("copies password to clipboard when copy button is clicked", async () => {
    await renderWithProviders(<PasswordPlayground />);

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
    await renderWithProviders(<PasswordPlayground />);

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
    await renderWithProviders(<PasswordPlayground />);

    const checkbox = screen.getByRole("checkbox", { name: /Mayúsculas/i });
    expect(checkbox).toBeChecked(); // Default is true

    await act(async () => {
      fireEvent.click(checkbox);
    });

    expect(checkbox).not.toBeChecked();
  });

  it("toggles numbers option when checkbox is clicked", async () => {
    await renderWithProviders(<PasswordPlayground />);

    const checkbox = screen.getByRole("checkbox", { name: /Números/i });
    expect(checkbox).toBeChecked(); // Default is true

    await act(async () => {
      fireEvent.click(checkbox);
    });

    expect(checkbox).not.toBeChecked();
  });

  it("toggles symbols option when checkbox is clicked", async () => {
    await renderWithProviders(<PasswordPlayground />);

    const checkbox = screen.getByRole("checkbox", { name: /Símbolos/i });
    expect(checkbox).not.toBeChecked(); // Default is false

    await act(async () => {
      fireEvent.click(checkbox);
    });

    expect(checkbox).toBeChecked();
  });

  it("shows strength indicator after generating password", async () => {
    await renderWithProviders(<PasswordPlayground />);

    const generateBtn = screen.getByRole("button", { name: /Generar/i });
    await act(async () => {
      fireEvent.click(generateBtn);
    });

    // Should show strength indicator
    expect(screen.getByText(/Fortaleza:/i)).toBeInTheDocument();
  });

  it("adds generated password to history", async () => {
    await renderWithProviders(<PasswordPlayground />);

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
    await renderWithProviders(<PasswordPlayground />);

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
