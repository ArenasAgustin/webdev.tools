import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { HtmlPreview } from "./HtmlPreview";

describe("HtmlPreview", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("does not reload the iframe or re-parse the DOM on every keystroke", () => {
    const parseSpy = vi.spyOn(DOMParser.prototype, "parseFromString");
    const { rerender } = render(<HtmlPreview source="<p>a</p>" />);
    const iframe = screen.getByTitle("Vista previa");
    expect(iframe.getAttribute("srcdoc")).toBe("<p>a</p>");
    const parsesAfterMount = parseSpy.mock.calls.length;

    rerender(<HtmlPreview source="<p>ab</p>" />);
    rerender(<HtmlPreview source="<p>abc</p>" />);

    expect(iframe.getAttribute("srcdoc")).toBe("<p>a</p>");
    expect(parseSpy.mock.calls.length).toBe(parsesAfterMount);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(iframe.getAttribute("srcdoc")).toBe("<p>abc</p>");
    expect(parseSpy.mock.calls.length).toBe(parsesAfterMount + 1);
  });

  it("summarizes the DOM of the previewed source", () => {
    render(<HtmlPreview source="<ul><li>1</li><li>2</li></ul>" />);

    expect(screen.getByTestId("dom-inspection-summary").textContent).toContain("li (2)");
  });

  it("shows the empty state when the source has no elements of its own", () => {
    render(<HtmlPreview source="just some text" />);

    expect(screen.queryByTestId("dom-inspection-summary")).toBeNull();
    expect(screen.getByText("Sin elementos para inspeccionar")).toBeInTheDocument();
  });

  it("does not count the implicit html, head and body wrappers", () => {
    render(<HtmlPreview source="<p>a</p>" />);

    expect(screen.getByTestId("dom-inspection-summary").textContent).toBe("p (1)");
  });

  it("says how many tag types were left out of the summary", () => {
    const tags = ["a", "b", "i", "p", "s", "u", "em", "h1", "h2", "h3"];
    render(<HtmlPreview source={tags.map((tag) => `<${tag}>x</${tag}>`).join("")} />);

    const summary = screen.getByTestId("dom-inspection-summary").textContent;
    expect(summary).toContain("a (1)");
    expect(summary).not.toContain("h2 (1)");
    expect(summary).toContain("+2 más");
  });
});
