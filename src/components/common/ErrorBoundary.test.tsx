import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { ErrorBoundary } from "./ErrorBoundary";

function Boom(): never {
  throw new Error("boom");
}

function Toggle() {
  const [broken, setBroken] = useState(false);
  return (
    <>
      {/* Same classes as the boundary heading: a global selector would focus this one */}
      <h2 className="text-lg font-semibold text-white">Unrelated heading</h2>
      <button type="button" onClick={() => setBroken(true)}>
        break
      </button>
      <ErrorBoundary name="Demo">{broken ? <Boom /> : <p>ok</p>}</ErrorBoundary>
    </>
  );
}

describe("ErrorBoundary", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("moves focus to its own error heading when a child throws", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<Toggle />);

    fireEvent.click(screen.getByRole("button", { name: "break" }));

    const heading = screen.getByRole("heading", { name: /demo/i });
    expect(heading).toHaveAttribute("tabindex", "-1");
    expect(heading).toHaveFocus();
  });
});
