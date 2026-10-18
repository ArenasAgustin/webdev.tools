import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { CodeEditor } from "./CodeEditor";

interface EditorMockProps {
  options?: { ariaLabel?: string; readOnly?: boolean };
}

const editorProps: EditorMockProps[] = [];

vi.mock("@monaco-editor/react", () => ({
  default: (props: EditorMockProps) => {
    editorProps.push(props);
    return <div data-testid="monaco-editor" />;
  },
}));

describe("CodeEditor", () => {
  beforeEach(() => {
    editorProps.length = 0;
  });

  it("passes an accessible name with the Tab focus hint to Monaco", () => {
    render(<CodeEditor value="" language="json" />);

    const ariaLabel = editorProps.at(-1)?.options?.ariaLabel;
    expect(ariaLabel).toBe(
      "Editor de código. Presioná Ctrl+M (Ctrl+Shift+M en macOS) para alternar si Tab indenta o mueve el foco.",
    );
  });
});
