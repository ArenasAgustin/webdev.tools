import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "./Header";

describe("Header", () => {
  it("renders header with title", () => {
    render(<Header />);

    expect(screen.getByText("JSON Tools")).toBeInTheDocument();
  });

  it("renders with code icon", () => {
    render(<Header />);

    const icon = screen.getByText("JSON Tools").parentElement?.querySelector("i");
    expect(icon?.className).toContain("fa-code");
  });

  it("renders with correct structure", () => {
    const { container } = render(<Header />);

    const header = container.querySelector("header");
    expect(header).toBeInTheDocument();
    expect(header?.tagName).toBe("HEADER");
  });

  it("renders with expected CSS classes", () => {
    const { container } = render(<Header />);

    const header = container.querySelector("header");
    expect(header?.className).toContain("text-center");
    expect(header?.className).toContain("col-start-1");
  });

  it("renders h1 with correct styling", () => {
    const { container } = render(<Header />);

    const h1 = container.querySelector("h1");
    expect(h1?.className).toContain("text-xl");
    expect(h1?.className).toContain("font-bold");
    expect(h1?.className).toContain("text-white");
  });
});
