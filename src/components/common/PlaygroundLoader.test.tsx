import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlaygroundLoader } from "./PlaygroundLoader";

describe("PlaygroundLoader", () => {
  it("displays the playground name", () => {
    render(<PlaygroundLoader name="CSS" />);
    expect(screen.getByText("Cargando CSS Tools")).toBeInTheDocument();
  });

  it("shows the preparing message", () => {
    render(<PlaygroundLoader name="JavaScript" />);
    expect(screen.getByText("Preparando el playground...")).toBeInTheDocument();
  });

  it("renders a spinner element", () => {
    const { container } = render(<PlaygroundLoader name="JSON" />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });
});
