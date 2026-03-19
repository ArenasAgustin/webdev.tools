import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "./ErrorBoundary";

function BrokenComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Test error message");
  }
  return <div>Contenido OK</div>;
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Contenido OK")).toBeInTheDocument();
  });

  it("renders fallback UI when a child throws", () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Algo salió mal")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reintentar/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Inicio/i })).toBeInTheDocument();
  });

  it("renders named fallback when name prop is provided", () => {
    render(
      <ErrorBoundary name="CSS Playground">
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Error en CSS Playground")).toBeInTheDocument();
  });

  it("resets state when Reintentar is clicked", () => {
    const { rerender } = render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Algo salió mal")).toBeInTheDocument();

    // Update child props first so re-render after reset doesn't throw again
    rerender(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={false} />
      </ErrorBoundary>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Reintentar/i }));

    expect(screen.getByText("Contenido OK")).toBeInTheDocument();
  });

  it("logs error to console on componentDidCatch", () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(console.error).toHaveBeenCalledWith(
      "[ErrorBoundary]",
      expect.any(Error),
      expect.any(String),
    );
  });
});
