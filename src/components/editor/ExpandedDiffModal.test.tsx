import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExpandedDiffModal } from "./ExpandedDiffModal";

vi.mock("./LazyDiffEditor", () => ({
  LazyDiffEditor: ({
    original,
    modified,
    language,
  }: {
    original: string;
    modified: string;
    language: string;
  }) => (
    <div
      data-testid="lazy-diff-editor"
      data-original={original}
      data-modified={modified}
      data-language={language}
    />
  ),
}));

describe("ExpandedDiffModal", () => {
  it("renders with correct props passed to the diff editor", () => {
    render(
      <ExpandedDiffModal original="const a = 1;" modified="const a = 2;" language="javascript" />,
    );

    const editor = screen.getByTestId("lazy-diff-editor");
    expect(editor).toBeInTheDocument();
    expect(editor).toHaveAttribute("data-original", "const a = 1;");
    expect(editor).toHaveAttribute("data-modified", "const a = 2;");
    expect(editor).toHaveAttribute("data-language", "javascript");
  });

  it("fires onClose when Escape key is pressed", () => {
    const onClose = vi.fn();
    render(<ExpandedDiffModal original="a" modified="b" language="json" onClose={onClose} />);

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not throw when Escape is pressed and onClose is undefined", () => {
    render(<ExpandedDiffModal original="a" modified="b" language="json" />);

    expect(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    }).not.toThrow();
  });
});
