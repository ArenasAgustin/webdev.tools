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
});
