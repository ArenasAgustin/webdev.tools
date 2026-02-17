import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useFocusTrap } from "./useFocusTrap";

function TestFocusTrapComponent({ isActive }: { isActive: boolean }) {
  const containerRef = useFocusTrap(isActive);

  return (
    <div ref={containerRef} data-testid="trap-container">
      <button data-testid="first-button">First</button>
      <input type="text" data-testid="text-input" placeholder="Type" />
      <button data-testid="second-button">Second</button>
    </div>
  );
}

function TestSingleFocusableComponent({ isActive }: { isActive: boolean }) {
  const containerRef = useFocusTrap(isActive);
  return (
    <div ref={containerRef} data-testid="trap-container">
      <button data-testid="single-button">Only</button>
    </div>
  );
}

describe("useFocusTrap", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("should focus first focusable element when activated", () => {
    render(<TestFocusTrapComponent isActive={true} />);
    const firstButton = screen.getByTestId("first-button");
    expect(document.activeElement).toBe(firstButton);
  });

  it("should not focus when inactive", () => {
    render(<TestFocusTrapComponent isActive={false} />);
    const firstButton = screen.getByTestId("first-button");
    expect(document.activeElement).not.toBe(firstButton);
  });

  it("should trap Tab to first element when at last", () => {
    render(<TestFocusTrapComponent isActive={true} />);

    const firstButton = screen.getByTestId("first-button");
    const secondButton = screen.getByTestId("second-button");
    const container = screen.getByTestId("trap-container");

    secondButton.focus();
    expect(document.activeElement).toBe(secondButton);

    fireEvent.keyDown(container, { key: "Tab" });
    expect(document.activeElement).toBe(firstButton);
  });

  it("should trap Shift+Tab to last element when at first", () => {
    render(<TestFocusTrapComponent isActive={true} />);

    const firstButton = screen.getByTestId("first-button");
    const secondButton = screen.getByTestId("second-button");
    const container = screen.getByTestId("trap-container");

    firstButton.focus();
    fireEvent.keyDown(container, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(secondButton);
  });

  it("should not trap non-Tab keys", () => {
    render(<TestFocusTrapComponent isActive={true} />);
    const container = screen.getByTestId("trap-container");

    const enterEvent = new KeyboardEvent("keydown", { key: "Enter" });
    expect(() => fireEvent.keyDown(container, enterEvent)).not.toThrow();
  });

  it("should handle single focusable element", () => {
    render(<TestSingleFocusableComponent isActive={true} />);
    const button = screen.getByTestId("single-button");

    expect(document.activeElement).toBe(button);

    const container = screen.getByTestId("trap-container");
    fireEvent.keyDown(container, { key: "Tab" });
    expect(document.activeElement).toBe(button);
  });

  it("should handle unmounting", () => {
    const { unmount } = render(<TestFocusTrapComponent isActive={true} />);
    expect(() => unmount()).not.toThrow();
  });
});
