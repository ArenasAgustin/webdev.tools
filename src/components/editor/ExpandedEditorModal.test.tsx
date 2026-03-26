import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExpandedEditorModal } from "./ExpandedEditorModal";

vi.mock("./LazyCodeEditor", () => ({
  LazyCodeEditor: ({
    placeholder,
    readOnly,
    onChange,
  }: {
    placeholder?: string;
    readOnly?: boolean;
    onChange?: (value: string) => void;
  }) => (
    <div data-testid="lazy-editor" data-readonly={String(readOnly ?? false)}>
      <span>{placeholder}</span>
      <button onClick={() => onChange?.("new value")}>trigger change</button>
    </div>
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

  it("passes readOnly prop to the editor", () => {
    render(
      <ExpandedEditorModal
        title="Read Only Editor"
        icon="lock"
        value="some content"
        language="json"
        readOnly={true}
      />,
    );

    expect(screen.getByTestId("lazy-editor")).toHaveAttribute("data-readonly", "true");
  });

  it("propagates onChange when the editor changes", () => {
    const onChange = vi.fn();
    render(
      <ExpandedEditorModal
        title="Editor Test"
        icon="edit"
        value="{}"
        language="json"
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByText("trigger change"));

    expect(onChange).toHaveBeenCalledWith("new value");
  });

  it("fires onClose when Escape key is pressed", () => {
    const onClose = vi.fn();
    render(
      <ExpandedEditorModal
        title="Editor Test"
        icon="edit"
        value="{}"
        language="json"
        onClose={onClose}
      />,
    );

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledOnce();
  });
});
