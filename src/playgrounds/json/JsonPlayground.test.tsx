import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderWithI18n } from "@/test/test-utils";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { JsonPlayground } from "./JsonPlayground";
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

vi.mock("@/components/editor/LazyCodeEditor", () => ({
  LazyCodeEditor: ({
    value,
    onChange,
    placeholder,
    readOnly,
  }: {
    value: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    readOnly?: boolean;
  }) => (
    <textarea
      data-testid={readOnly ? "output-editor" : "input-editor"}
      value={value}
      readOnly={readOnly}
      placeholder={placeholder}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
}));

// Mock del servicio de transformación de JSON
vi.mock("@/services/json/service", () => ({
  formatJson: vi.fn().mockImplementation((json) => Promise.resolve(JSON.stringify(JSON.parse(json), null, 2))),
  minifyJson: vi.fn().mockImplementation((json) => Promise.resolve(JSON.stringify(JSON.parse(json)))),
}));

// Mock del worker para evitar waitFor
vi.mock("@/services/json/workerClient", () => ({
  transformJson: vi.fn().mockImplementation((input) => Promise.resolve(input)),
}));

// Mock del servicio de transformación para devolver resultados inmediatamente
vi.mock("@/services/json/service", () => ({
  formatJson: vi.fn().mockImplementation((json) => JSON.stringify(JSON.parse(json), null, 2)),
  minifyJson: vi.fn().mockImplementation((json) => JSON.stringify(JSON.parse(json))),
}));

describe("JsonPlayground", () => {
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
  };

  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    localStorageMock.clear();
    
    // Mock completo de window para evitar ReferenceError
    global.window = {
      ...global.window,
      location: {
        ...global.window?.location,
        pathname: "/",
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as any;
  });

  afterEach(() => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    vi.restoreAllMocks();
  });

  const renderWithProviders = (component: React.ReactNode) => {
    return renderWithI18n(
      <ToastProvider>
        {component}
      </ToastProvider>
    );
  };

  it("renders with example input by default", () => {
    renderWithProviders(<JsonPlayground />);

    const input = screen.getByTestId("input-editor") as HTMLTextAreaElement;

    expect(input.value).toContain("users");
  });

  it("renders with saved JSON from localStorage", () => {
    const savedJson = '{"saved":true}';
    localStorageMock.setItem("lastJson", savedJson);
    
    // Forzar la recarga del componente
    const { rerender } = renderWithProviders(<JsonPlayground />);
    rerender(<JsonPlayground />);

    const input = screen.getByTestId("input-editor") as HTMLTextAreaElement;

    expect(input.value).toContain("saved");
  });

  it("formats and minifies input JSON", async () => {
    renderWithProviders(<JsonPlayground />);

    const input = screen.getByTestId("input-editor") as HTMLTextAreaElement;
    const output = screen.getByTestId("output-editor") as HTMLTextAreaElement;

    fireEvent.change(input, {
      target: { value: '{"name":"test","value":42}' },
    });
    fireEvent.click(screen.getByRole("button", { name: /Formatear/i }));
    expect(output.value).toContain('"name": "test"');
    expect(output.value).toContain('"value": 42');

    fireEvent.change(input, {
      target: {
        value: `{
  "name": "test",
  "value": 42
}`,
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /Minificar/i }));
    expect(output.value).toContain('{"name":"test","value":42}');
  });
});
