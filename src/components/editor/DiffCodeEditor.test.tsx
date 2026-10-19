import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { DiffCodeEditor } from "./DiffCodeEditor";

interface DiffEditorMockProps {
  options?: { originalAriaLabel?: string; modifiedAriaLabel?: string };
}

const diffEditorProps: DiffEditorMockProps[] = [];

vi.mock("@monaco-editor/react", () => ({
  DiffEditor: (props: DiffEditorMockProps) => {
    diffEditorProps.push(props);
    return <div data-testid="monaco-diff-editor" />;
  },
}));

describe("DiffCodeEditor", () => {
  beforeEach(() => {
    diffEditorProps.length = 0;
  });

  it("passes accessible names for both diff sides to Monaco", () => {
    render(<DiffCodeEditor original="a" modified="b" language="json" />);

    const options = diffEditorProps.at(-1)?.options;
    expect(options?.originalAriaLabel).toBe("Código original (solo lectura)");
    expect(options?.modifiedAriaLabel).toBe("Código resultante (solo lectura)");
  });
});
