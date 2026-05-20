import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { JsPlayground } from "./JsPlayground";
import { ToastProvider } from "@/context/ToastContext";
import { renderWithI18n, cleanupI18n } from "@/test/test-utils";

interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  length: number;
  key(index: number): string | null;
}

// Recursos de i18n para este test
const i18nResources = {
  "js.run": "Ejecutar",
  "js.format": "Formatear",
  "js.minify": "Minificar",
};

// Limpiar i18n después de cada test
afterEach(async () => {
  await cleanupI18n();
});

// Mock localStorage
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

describe("JsPlayground", () => {
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

  const renderWithProviders = async (component: React.ReactNode) => {
    return await renderWithI18n(<ToastProvider>{component}</ToastProvider>, i18nResources);
  };

  it("renders the example code by default", async () => {
    await renderWithProviders(<JsPlayground />);

    const editors = screen.getAllByRole("textbox");
    const input = editors[0] as HTMLTextAreaElement;

    expect(input.value).toContain("factorial");
  });

  it("executes code and displays console output", async () => {
    await renderWithProviders(<JsPlayground />);

    const editors = screen.getAllByRole("textbox");
    const input = editors[0] as HTMLTextAreaElement;
    const output = editors[1] as HTMLTextAreaElement;

    fireEvent.change(input, { target: { value: 'console.log("Hola")' } });
    fireEvent.click(screen.getByRole("button", { name: /Ejecutar/i }));

    await waitFor(() => {
      expect(output.value).toBe("Hola");
    });
  });

  it("shows runtime errors when execution fails", async () => {
    await renderWithProviders(<JsPlayground />);

    const editors = screen.getAllByRole("textbox");
    const input = editors[0] as HTMLTextAreaElement;

    fireEvent.change(input, {
      target: { value: 'throw new Error("Boom")' },
    });
    fireEvent.click(screen.getByRole("button", { name: /Ejecutar/i }));

    await waitFor(() => {
      expect(screen.getByText("Boom")).toBeInTheDocument();
    });
  });

  it("formats and minifies input code", async () => {
    await renderWithProviders(<JsPlayground />);

    const editors = screen.getAllByRole("textbox");
    const input = editors[0] as HTMLTextAreaElement;
    const output = editors[1] as HTMLTextAreaElement;

    fireEvent.change(input, { target: { value: "const x=1;" } });
    fireEvent.click(screen.getByRole("button", { name: /Formatear/i }));

    await waitFor(() => {
      expect(output.value).toBe("const x = 1;");
    });

    expect(input.value).toBe("const x=1;");

    fireEvent.click(screen.getByRole("button", { name: /Minificar/i }));

    await waitFor(() => {
      expect(output.value).toBe("const x=1;");
    });
  });

  it("formats multi-line blocks", async () => {
    await renderWithProviders(<JsPlayground />);

    const editors = screen.getAllByRole("textbox");
    const input = editors[0] as HTMLTextAreaElement;
    const output = editors[1] as HTMLTextAreaElement;

    fireEvent.change(input, {
      target: { value: "if(true){console.log(1);}" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Formatear/i }));

    await waitFor(() => {
      expect(output.value).toBe("if (true) {\n  console.log(1);\n}");
    });

    expect(input.value).toBe("if(true){console.log(1);}");
  });

  it("minifies by removing comments and whitespace", async () => {
    await renderWithProviders(<JsPlayground />);

    const editors = screen.getAllByRole("textbox");
    const input = editors[0] as HTMLTextAreaElement;
    const output = editors[1] as HTMLTextAreaElement;

    fireEvent.change(input, {
      target: {
        value: "// comment\nconst x = 1; /* block */\nconst y = x + 2;",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /Minificar/i }));

    await waitFor(() => {
      expect(output.value).toContain("const x=1");
      expect(output.value).toContain("y=3");
    });

    expect(input.value).toContain("// comment");
  });
});
