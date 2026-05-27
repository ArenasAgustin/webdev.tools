import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderWithI18n } from "@/test/test-utils";
import { fireEvent, screen, act } from "@testing-library/react";
import { JsonPlayground } from "./JsonPlayground";
import { ToastProvider } from "@/context/ToastContext";
import '@testing-library/jest-dom/vitest';

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
  formatJson: vi.fn().mockImplementation((json) => JSON.stringify(JSON.parse(json), null, 2)),
  minifyJson: vi.fn().mockImplementation((json) => JSON.stringify(JSON.parse(json))),
}));

// Mock del worker para evitar waitFor
vi.mock("@/services/json/workerClient", () => ({
  transformJson: vi.fn().mockImplementation((input) => Promise.resolve(input)),
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
    
    // Mocking window.location
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        pathname: "/",
      },
      writable: true,
    });
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

  // Wrapper para asegurar que ToastProvider esté disponible
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ToastProvider>
      {children}
    </ToastProvider>
  );

  it("renders with example input by default", () => {
    renderWithI18n(
      <Wrapper>
        <JsonPlayground />
      </Wrapper>
    );

    const input = screen.getByTestId("input-editor") as HTMLTextAreaElement;

    expect(input.value).toContain("users");
  });

  it("renders with saved JSON from localStorage", () => {
    const savedJson = '{"saved":true}';
    localStorageMock.setItem("lastJson", savedJson);
    
    renderWithI18n(
      <Wrapper>
        <JsonPlayground />
      </Wrapper>
    );

    const input = screen.getByTestId("input-editor") as HTMLTextAreaElement;

    expect(input.value).toContain("saved");
  });


});
