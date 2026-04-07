import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Toast } from "./Toast";

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders message with success variant", () => {
    const onRemove = vi.fn();
    render(
      <Toast
        message="Operation successful"
        variant="success"
        duration={3000}
        onRemove={onRemove}
      />,
    );

    expect(screen.getByText("Operation successful")).toBeInTheDocument();
    expect(screen.getByLabelText("Close notification")).toBeInTheDocument();
  });

  it("renders message with error variant", () => {
    const onRemove = vi.fn();
    render(
      <Toast message="Something went wrong" variant="error" duration={3000} onRemove={onRemove} />,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders message with info variant", () => {
    const onRemove = vi.fn();
    render(<Toast message="Information here" variant="info" duration={3000} onRemove={onRemove} />);

    expect(screen.getByText("Information here")).toBeInTheDocument();
  });

  it("calls onRemove after duration expires", () => {
    const onRemove = vi.fn();
    render(<Toast message="Auto dismiss" variant="success" duration={3000} onRemove={onRemove} />);

    // Component has two timers: 300ms for entering animation + duration + 200ms for exit
    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(onRemove).toHaveBeenCalled();
  });

  it("calls onRemove when close button is clicked", () => {
    const onRemove = vi.fn();
    render(
      <Toast message="Click to close" variant="success" duration={3000} onRemove={onRemove} />,
    );

    fireEvent.click(screen.getByLabelText("Close notification"));

    // Animation delay before onRemove is called
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(onRemove).toHaveBeenCalled();
  });

  it("clears timers on unmount", () => {
    const onRemove = vi.fn();
    const { unmount } = render(
      <Toast message="Test" variant="success" duration={3000} onRemove={onRemove} />,
    );

    unmount();

    // Try to advance timers - if timers weren't cleared, this would cause issues
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // onRemove should NOT have been called because component was unmounted
    expect(onRemove).not.toHaveBeenCalled();
  });

  it("applies correct CSS classes for success variant", () => {
    const onRemove = vi.fn();
    render(<Toast message="Success toast" variant="success" duration={3000} onRemove={onRemove} />);

    // Get the outermost div (with the transform classes)
    const element = screen.getByText("Success toast");
    const outerDiv = element.parentElement?.parentElement;
    expect(outerDiv?.className).toContain("transform");
    expect(outerDiv?.className).toContain("transition-all");
  });

  it("handles short duration", () => {
    const onRemove = vi.fn();
    render(<Toast message="Quick toast" variant="info" duration={100} onRemove={onRemove} />);

    // 300ms entering + 100ms duration + 200ms exit
    act(() => {
      vi.advanceTimersByTime(650);
    });

    expect(onRemove).toHaveBeenCalled();
  });

  it("handles long duration", () => {
    const onRemove = vi.fn();
    render(<Toast message="Long toast" variant="success" duration={10000} onRemove={onRemove} />);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onRemove).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(5500);
    });

    expect(onRemove).toHaveBeenCalled();
  });

  it("renders with correct icon for success variant", () => {
    const onRemove = vi.fn();
    render(<Toast message="Test" variant="success" duration={3000} onRemove={onRemove} />);

    const icon = screen.getByText("Test").parentElement?.querySelector("i");
    expect(icon?.className).toContain("fa-check-circle");
  });

  it("renders with correct icon for error variant", () => {
    const onRemove = vi.fn();
    render(<Toast message="Test" variant="error" duration={3000} onRemove={onRemove} />);

    const icon = screen.getByText("Test").parentElement?.querySelector("i");
    expect(icon?.className).toContain("fa-exclamation-circle");
  });

  it("renders with correct icon for info variant", () => {
    const onRemove = vi.fn();
    render(<Toast message="Test" variant="info" duration={3000} onRemove={onRemove} />);

    const icon = screen.getByText("Test").parentElement?.querySelector("i");
    expect(icon?.className).toContain("fa-info-circle");
  });
});
