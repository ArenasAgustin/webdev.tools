import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { useContext } from "react";
import { ToastProvider } from "./ToastContext";
import { ToastContext } from "./toast.context";

function TestConsumer() {
  const context = useContext(ToastContext);

  if (!context) return null;

  return (
    <div>
      <button onClick={() => context.addToast("ok", "success")}>add-success</button>
      <button onClick={() => context.addToast("fail", "error")}>add-error</button>
      <button onClick={() => context.addToast("info", "info")}>add-info</button>
      <button onClick={() => context.toasts[0] && context.removeToast(context.toasts[0].id)}>
        remove-first
      </button>
      <div data-testid="count">{context.toasts.length}</div>
      <div data-testid="messages">{context.toasts.map((t) => t.message).join(",")}</div>
    </div>
  );
}

describe("ToastProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("adds and removes toasts", () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("add-success"));
    expect(screen.getByTestId("count")).toHaveTextContent("1");

    fireEvent.click(screen.getByText("remove-first"));
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("keeps a maximum of 6 toasts", () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );

    for (let i = 0; i < 7; i++) {
      fireEvent.click(screen.getByText("add-info"));
    }

    expect(screen.getByTestId("count")).toHaveTextContent("6");
  });

  it("auto-dismisses toast after timeout", () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("add-error"));
    expect(screen.getByTestId("count")).toHaveTextContent("1");

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });
});
