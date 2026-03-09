import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
      value={value}
      readOnly={readOnly}
      placeholder={placeholder}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
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
  });

  afterEach(() => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    vi.restoreAllMocks();
  });

  const renderWithProviders = (component: React.ReactNode) => {
    return render(<ToastProvider>{component}</ToastProvider>);
  };

  it("renders with empty input by default", () => {
    renderWithProviders(<JsonPlayground />);

    const editors = screen.getAllByRole("textbox");
    const input = editors[0] as HTMLTextAreaElement;

    expect(input.value).toBe("");
  });

  it("renders with saved JSON from localStorage", () => {
    localStorageMock.setItem("lastJson", '{"saved":true}');
    renderWithProviders(<JsonPlayground />);

    const editors = screen.getAllByRole("textbox");
    const input = editors[0] as HTMLTextAreaElement;

    expect(input.value).toContain("saved");
  });

  it("formats and minifies input JSON", async () => {
    renderWithProviders(<JsonPlayground />);

    const editors = screen.getAllByRole("textbox");
    const input = editors[0] as HTMLTextAreaElement;
    const output = editors[1] as HTMLTextAreaElement;

    fireEvent.change(input, {
      target: { value: '{"name":"test","value":42}' },
    });
    fireEvent.click(screen.getByRole("button", { name: /Formatear/i }));

    await waitFor(() => {
      expect(output.value).toContain('"name": "test"');
      expect(output.value).toContain('"value": 42');
    });

    fireEvent.change(input, {
      target: {
        value: `{
  "name": "test",
  "value": 42
}`,
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /Minificar/i }));

    await waitFor(() => {
      expect(output.value).toContain('{"name":"test","value":42}');
    });
  });
});
