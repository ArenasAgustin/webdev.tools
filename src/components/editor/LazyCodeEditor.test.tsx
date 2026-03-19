import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LazyCodeEditor } from "./LazyCodeEditor";

vi.mock("./CodeEditor", () => ({
  CodeEditor: ({
    value,
    placeholder,
    language,
    readOnly,
  }: {
    value: string;
    placeholder?: string;
    language: string;
    readOnly?: boolean;
  }) => (
    <div
      data-testid="code-editor"
      data-language={language}
      data-readonly={String(readOnly ?? false)}
    >
      {value || placeholder}
    </div>
  ),
}));

vi.mock("./CodeEditorLoader", () => ({
  CodeEditorLoader: () => <div data-testid="editor-loader">Cargando editor...</div>,
}));

describe("LazyCodeEditor", () => {
  it("renders CodeEditor after lazy resolution", async () => {
    render(<LazyCodeEditor value="const x = 1;" language="javascript" />);
    const editor = await screen.findByTestId("code-editor");
    expect(editor).toBeInTheDocument();
    expect(screen.getByText("const x = 1;")).toBeInTheDocument();
  });

  it("passes language prop to CodeEditor", async () => {
    render(<LazyCodeEditor value="" language="css" />);
    const editor = await screen.findByTestId("code-editor");
    expect(editor).toHaveAttribute("data-language", "css");
  });

  it("passes readOnly prop to CodeEditor", async () => {
    render(<LazyCodeEditor value="text" language="json" readOnly />);
    const editor = await screen.findByTestId("code-editor");
    expect(editor).toHaveAttribute("data-readonly", "true");
  });

  it("renders placeholder when value is empty", async () => {
    render(<LazyCodeEditor value="" language="html" placeholder="Escribe aquí..." />);
    await screen.findByTestId("code-editor");
    expect(screen.getByText("Escribe aquí...")).toBeInTheDocument();
  });
});
