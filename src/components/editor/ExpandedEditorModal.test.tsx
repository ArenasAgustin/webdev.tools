import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExpandedEditorModal } from "./ExpandedEditorModal";

vi.mock("./LazyCodeEditor", () => ({
  LazyCodeEditor: ({ placeholder }: { placeholder?: string }) => (
    <div data-testid="lazy-editor">{placeholder}</div>
  ),
}));

describe("ExpandedEditorModal", () => {
  it("renders title and editor placeholder", () => {
    render(<ExpandedEditorModal title="Editor Test" icon="🧪" value="{}" language="json" />);

    expect(screen.getByText("Editor Test")).toBeInTheDocument();
    expect(screen.getByTestId("lazy-editor")).toHaveTextContent("Contenido de Editor Test...");
  });

  it("renders optional actions and footer", () => {
    render(
      <ExpandedEditorModal
        title="Editor Test"
        icon="🧪"
        value="{}"
        language="json"
        actions={<button>action</button>}
        footer={<div>footer</div>}
      />,
    );

    expect(screen.getByText("action")).toBeInTheDocument();
    expect(screen.getByText("footer")).toBeInTheDocument();
  });
});
