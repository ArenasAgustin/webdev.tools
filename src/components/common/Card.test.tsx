import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card";

describe("Card", () => {
  it("should render children content", () => {
    render(
      <Card>
        <p>Test content</p>
      </Card>,
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("should render with title when provided", () => {
    render(
      <Card title="Test Title">
        <p>Content</p>
      </Card>,
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("should render without title when not provided", () => {
    render(
      <Card>
        <p>Content only</p>
      </Card>,
    );

    expect(screen.getByText("Content only")).toBeInTheDocument();
  });

  it("should apply correct styling classes", () => {
    const { container } = render(
      <Card title="Styled Card">
        <div>Content</div>
      </Card>,
    );

    const card = container.firstChild;
    expect(card).toHaveClass("border");
    expect(card).toHaveClass("rounded-lg");
    expect(card).toHaveClass("p-3");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <Card className="bg-gray-800">
        <p>Content</p>
      </Card>,
    );

    const card = container.firstChild;
    expect(card).toHaveClass("bg-gray-800");
  });
});
