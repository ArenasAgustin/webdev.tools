import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PhpPlayground } from "./PhpPlayground";
import { ToastProvider } from "@/context/ToastContext";

// Mock localStorage
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

describe("PhpPlayground", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithProviders = (component: React.ReactNode) => {
    return render(<ToastProvider>{component}</ToastProvider>);
  };

  it("renders the example PHP code by default", () => {
    renderWithProviders(<PhpPlayground />);

    const editors = screen.getAllByRole("textbox");
    const input = editors[0] as HTMLTextAreaElement;

    expect(input.value).toContain("<?php");
    expect(input.value).toContain("factorial");
  });

  it("formats PHP code and displays output", async () => {
    renderWithProviders(<PhpPlayground />);

    const editors = screen.getAllByRole("textbox");
    const input = editors[0] as HTMLTextAreaElement;
    const output = editors[1] as HTMLTextAreaElement;

    fireEvent.change(input, { target: { value: "<?php echo 'hello';" } });
    fireEvent.click(screen.getByRole("button", { name: /Formatear/i }));

    await waitFor(() => {
      expect(output.value).toContain("echo");
      expect(output.value).toContain("hello");
    });

    expect(input.value).toBe("<?php echo 'hello';");
  });
});
