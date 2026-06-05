import { describe, it, expect } from "vitest";
import { renderWithI18n } from "@/test/test-utils";
import { Card } from "./Card";

describe("Card", () => {
  it("should render children content", () => {
    const { getByText } = renderWithI18n(
      <Card>
        <p>Test content</p>
      </Card>,
    );

    expect(getByText("Test content")).toBeInTheDocument();
  });

  it("should render with title when provided", () => {
    const { getByText } = renderWithI18n(
      <Card title="Test Title">
        <p>Content</p>
      </Card>,
    );

    expect(getByText("Test Title")).toBeInTheDocument();
    expect(getByText("Content")).toBeInTheDocument();
  });

  it("should render without title when not provided", () => {
    const { getByText } = renderWithI18n(
      <Card>
        <p>Content only</p>
      </Card>,
    );

    expect(getByText("Content only")).toBeInTheDocument();
  });

  it("should apply correct styling classes", () => {
    const { container } = renderWithI18n(
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
    const { container } = renderWithI18n(
      <Card className="bg-gray-800">
        <p>Content</p>
      </Card>,
    );

    const card = container.firstChild;
    expect(card).toHaveClass("bg-gray-800");
  });
});
