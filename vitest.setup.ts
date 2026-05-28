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
    addEventListener: (event: string, listener: EventListener) => {},
    removeEventListener: (event: string, listener: EventListener) => {},
    dispatchEvent: (event: Event) => true,
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
  default: {
    t: (key: string) => key, // Por defecto, devolver la key como texto
    use: vi.fn(),
    init: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    changeLanguage: vi.fn().mockResolvedValue(null),
    getFixedT: vi.fn(() => (key: string) => key),
    language: 'es',
    languages: ['es'],
    isInitialized: true,
    exists: vi.fn(),
    hasLoadedNamespace: vi.fn().mockReturnValue(true),
  },
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
