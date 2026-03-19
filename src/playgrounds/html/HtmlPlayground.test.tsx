import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { HtmlPlayground } from "./HtmlPlayground";
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

describe("HtmlPlayground", () => {
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

  it("renders the example HTML by default", () => {
    renderWithProviders(<HtmlPlayground />);

    const editors = screen.getAllByRole("textbox");
    const input = editors[0] as HTMLTextAreaElement;

    expect(input.value).toContain("<!doctype html>");
  });

  it("toggles HTML preview and shows DOM inspection", () => {
    renderWithProviders(<HtmlPlayground />);

    expect(screen.queryByText("Vista previa")).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Ver vista previa"));
    expect(screen.getByText("Vista previa")).toBeInTheDocument();
    expect(screen.getByTitle("Vista previa HTML")).toBeInTheDocument();
    expect(screen.getByTestId("dom-inspection-summary").textContent).toContain("html");

    fireEvent.click(screen.getByLabelText("Ver resultado"));
    expect(screen.getByText("Resultado")).toBeInTheDocument();
  });

  it("formats and minifies input HTML", async () => {
    renderWithProviders(<HtmlPlayground />);

    const editors = screen.getAllByRole("textbox");
    const input = editors[0] as HTMLTextAreaElement;
    const output = editors[1] as HTMLTextAreaElement;

    fireEvent.change(input, {
      target: { value: "<div   class='x' id='y'><span>ok</span></div>" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Formatear/i }));

    await waitFor(() => {
      expect(output.value).toContain('<div class="x" id="y">');
    });

    fireEvent.change(input, {
      target: {
        value: `<div>\n  <!-- remove -->\n  <span>ok</span>\n</div>`,
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /Minificar/i }));

    await waitFor(() => {
      expect(output.value).toContain("<div><span>ok</span></div>");
      expect(output.value).not.toContain("remove");
    });
  });
});
