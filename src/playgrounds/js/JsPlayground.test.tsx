import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { JsPlayground } from "./JsPlayground";

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
  });

  afterEach(() => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    vi.restoreAllMocks();
  });

  it("renders the example code by default", () => {
    render(<JsPlayground />);

    const editors = screen.getAllByRole("textbox") as HTMLTextAreaElement[];
    const input = editors[0];

    expect(input.value).toContain("factorial");
  });

  it("executes code and displays console output", () => {
    render(<JsPlayground />);

    const editors = screen.getAllByRole("textbox") as HTMLTextAreaElement[];
    const input = editors[0];
    const output = editors[1];

    fireEvent.change(input, { target: { value: 'console.log("Hola")' } });
    fireEvent.click(screen.getByRole("button", { name: /Ejecutar/i }));

    expect(output.value).toBe("Hola");
  });

  it("shows runtime errors when execution fails", () => {
    render(<JsPlayground />);

    const editors = screen.getAllByRole("textbox") as HTMLTextAreaElement[];
    const input = editors[0];

    fireEvent.change(input, {
      target: { value: 'throw new Error("Boom")' },
    });
    fireEvent.click(screen.getByRole("button", { name: /Ejecutar/i }));

    expect(screen.getByText("Boom")).toBeInTheDocument();
  });

  it("formats and minifies input code", () => {
    render(<JsPlayground />);

    const editors = screen.getAllByRole("textbox") as HTMLTextAreaElement[];
    const input = editors[0];

    fireEvent.change(input, { target: { value: "const x=1;" } });
    fireEvent.click(screen.getByRole("button", { name: /Formatear/i }));

    expect(input.value).toBe("const x = 1;");

    fireEvent.click(screen.getByRole("button", { name: /Minificar/i }));

    expect(input.value).toBe("const x=1;");
  });

  it("formats multi-line blocks", () => {
    render(<JsPlayground />);

    const editors = screen.getAllByRole("textbox") as HTMLTextAreaElement[];
    const input = editors[0];

    fireEvent.change(input, {
      target: { value: "if(true){console.log(1);}" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Formatear/i }));

    expect(input.value).toBe("if(true){\n  console.log(1);\n}");
  });

  it("minifies by removing comments and whitespace", () => {
    render(<JsPlayground />);

    const editors = screen.getAllByRole("textbox") as HTMLTextAreaElement[];
    const input = editors[0];

    fireEvent.change(input, {
      target: {
        value: "// comment\nconst x = 1; /* block */\nconst y = x + 2;",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /Minificar/i }));

    expect(input.value).toBe("const x=1; const y=x+2;");
  });
});
