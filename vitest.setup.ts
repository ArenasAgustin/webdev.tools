// Mock para window y navigator en entorno de testing
if (typeof window === "undefined") {
  // @ts-expect-error - Mock para compatibilidad con SSR en tests
  globalThis.window = globalThis;
}

// Mock para localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
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

// Asignar localStorage a globalThis
Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Mock para window y navigator
Object.defineProperty(globalThis, "window", {
  value: {
    location: {
      pathname: "/",
    },
    localStorage: localStorageMock,
    addEventListener: (_event: string, _listener: EventListener) => {},
    removeEventListener: (_event: string, _listener: EventListener) => {},
    dispatchEvent: (event: Event) => true,
    document: {
      createElement: vi.fn(() => ({})),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
    navigator: {
      onLine: true,
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    },
    requestAnimationFrame: vi.fn(),
    cancelAnimationFrame: vi.fn(),
  },
  writable: true,
});

Object.defineProperty(globalThis, "navigator", {
  value: {
    onLine: true,
  },
  writable: true,
});

// Mock para i18next
vi.mock("i18next", () => ({
  t: (key: string) => {
    const translations: Record<string, string> = {
      "error.title": "Error",
      "error.retry": "Reintentar",
      "error.copy": "Copiar error",
      "error.boundary.title": "Algo salió mal",
      "error.boundary.description": "Se produjo un error inesperado.",
      "toggle_button_group.checkbox": "Checkbox",
      "playground_layout.editors": "Editors content",
      "playground_layout.toolbar": "Toolbar content",
      "playground_layout.panel": "Panel content",
      "shortcuts.title": "Atajos de teclado",
      "shortcuts.cleanEmpty": "Limpiar vacíos",
      "shortcuts.transform": "Transformar",
      "shortcuts.format": "Formatear código",
      "shortcuts.minify": "Minificar código",
      "shortcuts.result": "Resultado",
      "shortcuts.copyResult": "Copiar resultado",
      "shortcuts.clearInput": "Limpiar entrada",
      "shortcuts.interface": "Interfaz",
      "shortcuts.openConfig": "Abrir configuración",
      "shortcuts.viewShortcuts": "Ver atajos",
      "shortcuts.viewDifferences": "Ver diferencias",
      "timestamp.placeholder": "Unix timestamp o fecha",
      "timestamp.convert": "Convertir",
      "timestamp.now": "Ahora",
      "timestamp.clear": "Limpiar",
      "timestamp.timezone": "Zona horaria:",
      "timestamp.copy": "Copiar",
      "timestamp.invalid_input": "Input inválido",
      "timestamp.future": "en el futuro",
    };
    return translations[key] || key;
  },
}));

// Mock react-i18next para que useTranslation devuelva el mock de i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: vi.fn((key: string) => {
      const translations: Record<string, string> = {
        "error.title": "Error",
        "error.retry": "Reintentar",
        "error.copy": "Copiar error",
        "error.boundary.title": "Algo salió mal",
        "error.boundary.description": "Se produjo un error inesperado.",
        "toggle_button_group.checkbox": "Checkbox",
        "playground_layout.editors": "Editors content",
        "playground_layout.toolbar": "Toolbar content",
        "playground_layout.panel": "Panel content",
        "shortcuts.title": "Atajos de teclado",
        "shortcuts.cleanEmpty": "Limpiar vacíos",
        "shortcuts.transform": "Transformar",
        "shortcuts.format": "Formatear código",
        "shortcuts.minify": "Minificar código",
        "shortcuts.result": "Resultado",
        "shortcuts.copyResult": "Copiar resultado",
        "shortcuts.clearInput": "Limpiar entrada",
        "shortcuts.interface": "Interfaz",
        "shortcuts.openConfig": "Abrir configuración",
        "shortcuts.viewShortcuts": "Ver atajos",
        "shortcuts.viewDifferences": "Ver diferencias",
      };
      return translations[key] || key;
    }),
    i18n: {
      language: "es",
      changeLanguage: vi.fn(),
    },
  }),
}));

// Mock para react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn().mockResolvedValue(null),
      language: 'es',
    },
  }),
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
  withTranslation: () => (Component: React.ComponentType) => Component,
}));
