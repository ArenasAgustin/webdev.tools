import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { screen, fireEvent, act } from "@testing-library/react";
import { Toast } from "./Toast";
import { ToastWrapper } from "@/test/ToastWrapper";

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
      <ToastWrapper>
        <Toast
          message="Operation successful"
          variant="success"
          duration={3000}
          onRemove={onRemove}
        />
      </ToastWrapper>
    );

    expect(screen.getByTestId("toast-message")).toHaveTextContent("Operation successful");
    expect(screen.getByLabelText("Close notification")).toBeInTheDocument();
  });

  it("renders message with error variant", () => {
    const onRemove = vi.fn();
    render(
      <ToastWrapper>
        <Toast message="Something went wrong" variant="error" duration={3000} onRemove={onRemove} />
      </ToastWrapper>
    );

    expect(screen.getByTestId("toast-message")).toHaveTextContent("Something went wrong");
  });

  it("renders message with info variant", () => {
    const onRemove = vi.fn();
    render(
      <ToastWrapper>
        <Toast message="Information here" variant="info" duration={3000} onRemove={onRemove} />
      </ToastWrapper>
    );

    expect(screen.getByTestId("toast-message")).toHaveTextContent("Information here");
  });

  it("calls onRemove after duration expires", () => {
    const onRemove = vi.fn();
    render(
      <ToastWrapper>
        <Toast message="Auto dismiss" variant="success" duration={3000} onRemove={onRemove} />
      </ToastWrapper>
    );

    // Component has two timers: 300ms for entering animation + duration + 200ms for exit
    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(onRemove).toHaveBeenCalled();
  });

  it("calls onRemove when close button is clicked", () => {
    const onRemove = vi.fn();
    render(
      <ToastWrapper>
        <Toast message="Click to close" variant="success" duration={3000} onRemove={onRemove} />
      </ToastWrapper>
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
      <ToastWrapper>
        <Toast message="Test" variant="success" duration={3000} onRemove={onRemove} />
      </ToastWrapper>
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
    render(
      <ToastWrapper>
        <Toast message="Success toast" variant="success" duration={3000} onRemove={onRemove} />
      </ToastWrapper>
    );

    // Get the outermost div (with the transform classes)
    const element = screen.getByTestId("toast-message");
    const outerDiv = element.parentElement?.parentElement;
    expect(outerDiv?.className).toContain("transform");
    expect(outerDiv?.className).toContain("transition-all");
  });

  it("handles short duration", () => {
    const onRemove = vi.fn();
    render(
      <ToastWrapper>
        <Toast message="Quick toast" variant="info" duration={100} onRemove={onRemove} />
      </ToastWrapper>
    );

    // 300ms entering + 100ms duration + 200ms exit
    act(() => {
      vi.advanceTimersByTime(650);
    });

    expect(onRemove).toHaveBeenCalled();
  });

  it("handles long duration", () => {
    const onRemove = vi.fn();
    render(
      <ToastWrapper>
        <Toast message="Long toast" variant="success" duration={10000} onRemove={onRemove} />
      </ToastWrapper>
    );

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
    render(
      <ToastWrapper>
        <Toast message="Test" variant="success" duration={3000} onRemove={onRemove} />
      </ToastWrapper>
    );

    const icon = screen.getByTestId("toast-message").parentElement?.querySelector("i");
    expect(icon?.className).toContain("fa-check-circle");
  });

  it("renders with correct icon for error variant", () => {
    const onRemove = vi.fn();
    render(
      <ToastWrapper>
        <Toast message="Test" variant="error" duration={3000} onRemove={onRemove} />
      </ToastWrapper>
    );

    const icon = screen.getByTestId("toast-message").parentElement?.querySelector("i");
    expect(icon?.className).toContain("fa-exclamation-circle");
  });

  it("renders with correct icon for info variant", () => {
    const onRemove = vi.fn();
    render(
      <ToastWrapper>
        <Toast message="Test" variant="info" duration={3000} onRemove={onRemove} />
      </ToastWrapper>
    );

    const icon = screen.getByTestId("toast-message").parentElement?.querySelector("i");
    expect(icon?.className).toContain("fa-info-circle");
  });
});
