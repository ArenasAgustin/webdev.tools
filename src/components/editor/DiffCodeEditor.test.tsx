import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { DiffCodeEditor } from "./DiffCodeEditor";

interface FakeDiffEditor {
  getOriginalEditor: () => { updateOptions: ReturnType<typeof vi.fn> };
  getModifiedEditor: () => { updateOptions: ReturnType<typeof vi.fn> };
}

interface DiffEditorMockProps {
  options?: { originalAriaLabel?: string; modifiedAriaLabel?: string };
  onMount?: (editor: FakeDiffEditor) => void;
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

  it("re-applies the accessible names on mount", () => {
    // Monaco's diff editor recomputes each pane's ariaLabel from the changed options
    // only, so its internal post-create option update wipes the construction labels.
    render(<DiffCodeEditor original="a" modified="b" language="json" />);
    const original = { updateOptions: vi.fn() };
    const modified = { updateOptions: vi.fn() };
    const editor: FakeDiffEditor = {
      getOriginalEditor: () => original,
      getModifiedEditor: () => modified,
    };

    diffEditorProps.at(-1)?.onMount?.(editor);

    expect(original.updateOptions).toHaveBeenCalledWith({
      ariaLabel: "Código original (solo lectura)",
    });
    expect(modified.updateOptions).toHaveBeenCalledWith({
      ariaLabel: "Código resultante (solo lectura)",
    });
  });
});
