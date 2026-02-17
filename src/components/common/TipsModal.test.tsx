import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TipsModal, type TipItem, type QuickExample } from "./TipsModal";

describe("TipsModal", () => {
  const mockTips: TipItem[] = [
    {
      id: "tip1",
      category: "Basic Operations",
      categoryIcon: "tool",
      categoryColor: "blue-400",
      items: [
        { code: "$.property", description: "Access property" },
        { code: "$.array[0]", description: "Access array element" },
      ],
    },
    {
      id: "tip2",
      category: "Advanced",
      categoryIcon: "star",
      categoryColor: "purple-400",
      items: [{ code: "$.array[*]", description: "Select all elements" }],
    },
  ];

  const mockExamples: QuickExample[] = [
    {
      code: "$.name",
      label: "Name",
      description: "Get name property",
    },
    {
      code: "$.users[0]",
      label: "First User",
      description: "Get first user",
    },
  ];

  it("should not render when closed", () => {
    render(
      <TipsModal
        isOpen={false}
        title="Tips"
        icon="lightbulb"
        tips={mockTips}
        onClose={() => {}}
        onTryExample={() => {}}
      />,
    );

    expect(screen.queryByText("Tips")).not.toBeInTheDocument();
  });

  it("should render when open", () => {
    render(
      <TipsModal
        isOpen={true}
        title="JSON Path Tips"
        icon="lightbulb"
        tips={mockTips}
        onClose={() => {}}
        onTryExample={() => {}}
      />,
    );

    expect(screen.getByText("JSON Path Tips")).toBeInTheDocument();
  });

  it("should render all tip categories", () => {
    render(
      <TipsModal
        isOpen={true}
        title="Tips"
        icon="lightbulb"
        tips={mockTips}
        onClose={() => {}}
        onTryExample={() => {}}
      />,
    );

    expect(screen.getByText("Basic Operations")).toBeInTheDocument();
    expect(screen.getByText("Advanced")).toBeInTheDocument();
  });

  it("should render all tip items", () => {
    render(
      <TipsModal
        isOpen={true}
        title="Tips"
        icon="lightbulb"
        tips={mockTips}
        onClose={() => {}}
        onTryExample={() => {}}
      />,
    );

    expect(screen.getByText("$.property")).toBeInTheDocument();
    expect(screen.getByText(/Access property/)).toBeInTheDocument();
    expect(screen.getByText("$.array[0]")).toBeInTheDocument();
    expect(screen.getByText(/Access array element/)).toBeInTheDocument();
    expect(screen.getByText("$.array[*]")).toBeInTheDocument();
    expect(screen.getByText(/Select all elements/)).toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", () => {
    const handleClose = vi.fn();
    render(
      <TipsModal
        isOpen={true}
        title="Tips"
        icon="lightbulb"
        tips={mockTips}
        onClose={handleClose}
        onTryExample={() => {}}
      />,
    );

    const closeButton = screen.getByLabelText("Cerrar modal");
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledOnce();
  });

  it("should render quick examples when provided", () => {
    render(
      <TipsModal
        isOpen={true}
        title="Tips"
        icon="lightbulb"
        tips={mockTips}
        quickExamples={mockExamples}
        onClose={() => {}}
        onTryExample={() => {}}
      />,
    );

    expect(screen.getByText("Ejemplos Rápidos")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Get name property")).toBeInTheDocument();
    expect(screen.getByText("First User")).toBeInTheDocument();
    expect(screen.getByText("Get first user")).toBeInTheDocument();
  });

  it("should not render quick examples section when empty", () => {
    render(
      <TipsModal
        isOpen={true}
        title="Tips"
        icon="lightbulb"
        tips={mockTips}
        quickExamples={[]}
        onClose={() => {}}
        onTryExample={() => {}}
      />,
    );

    expect(screen.queryByText("Ejemplos Rápidos")).not.toBeInTheDocument();
  });

  it("should call onTryExample when quick example button is clicked", () => {
    const handleTryExample = vi.fn();
    render(
      <TipsModal
        isOpen={true}
        title="Tips"
        icon="lightbulb"
        tips={mockTips}
        quickExamples={mockExamples}
        onClose={() => {}}
        onTryExample={handleTryExample}
      />,
    );

    const firstExampleButton = screen.getByText("Name").closest("button");
    if (firstExampleButton) {
      fireEvent.click(firstExampleButton);
    }

    expect(handleTryExample).toHaveBeenCalledWith("$.name");
  });

  it("should apply different colors based on categoryColor", () => {
    const colorfulTips: TipItem[] = [
      {
        id: "green",
        category: "Green Category",
        categoryColor: "green-400",
        items: [{ code: "test", description: "test" }],
      },
      {
        id: "orange",
        category: "Orange Category",
        categoryColor: "orange-400",
        items: [{ code: "test2", description: "test2" }],
      },
    ];

    const { container } = render(
      <TipsModal
        isOpen={true}
        title="Tips"
        icon="lightbulb"
        tips={colorfulTips}
        onClose={() => {}}
        onTryExample={() => {}}
      />,
    );

    // Verify that color-specific classes are applied
    expect(container.innerHTML).toContain("bg-green-500/10");
    expect(container.innerHTML).toContain("bg-orange-500/10");
  });

  it("should use default blue color when categoryColor is not specified", () => {
    const defaultColorTip: TipItem[] = [
      {
        id: "default",
        category: "Default Category",
        items: [{ code: "test", description: "test" }],
      },
    ];

    const { container } = render(
      <TipsModal
        isOpen={true}
        title="Tips"
        icon="lightbulb"
        tips={defaultColorTip}
        onClose={() => {}}
        onTryExample={() => {}}
      />,
    );

    expect(container.innerHTML).toContain("bg-blue-500/10");
  });
});
