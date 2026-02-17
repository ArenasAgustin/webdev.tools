import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { JsonPathHistoryModal } from "./JsonPathHistoryModal";
import type { JsonPathHistoryItem } from "@/hooks/useJsonPathHistory";

describe("JsonPathHistoryModal", () => {
  const mockHistory: JsonPathHistoryItem[] = [
    {
      id: "1",
      expression: "$.users[*].name",
      timestamp: new Date("2024-01-15T10:30:00").getTime(),
      frequency: 5,
    },
    {
      id: "2",
      expression: "$.products[?(@.price > 100)]",
      timestamp: new Date("2024-01-15T11:00:00").getTime(),
      frequency: 2,
    },
  ];

  it("should not render when closed", () => {
    render(
      <JsonPathHistoryModal
        isOpen={false}
        history={mockHistory}
        onClose={() => {}}
        onReuse={() => {}}
        onDelete={() => {}}
        onClearAll={() => {}}
      />,
    );

    expect(screen.queryByText("Historial de Filtros")).not.toBeInTheDocument();
  });

  it("should render when open", () => {
    render(
      <JsonPathHistoryModal
        isOpen={true}
        history={mockHistory}
        onClose={() => {}}
        onReuse={() => {}}
        onDelete={() => {}}
        onClearAll={() => {}}
      />,
    );

    expect(screen.getByText("Historial de Filtros")).toBeInTheDocument();
  });

  it("should display all history items", () => {
    render(
      <JsonPathHistoryModal
        isOpen={true}
        history={mockHistory}
        onClose={() => {}}
        onReuse={() => {}}
        onDelete={() => {}}
        onClearAll={() => {}}
      />,
    );

    expect(screen.getByText("$.users[*].name")).toBeInTheDocument();
    expect(screen.getByText("$.products[?(@.price > 100)]")).toBeInTheDocument();
    expect(screen.getByText("×5")).toBeInTheDocument();
    expect(screen.getByText("×2")).toBeInTheDocument();
  });

  it("should show empty state when no history", () => {
    render(
      <JsonPathHistoryModal
        isOpen={true}
        history={[]}
        onClose={() => {}}
        onReuse={() => {}}
        onDelete={() => {}}
        onClearAll={() => {}}
      />,
    );

    expect(screen.getByText("No hay historial reciente")).toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", () => {
    const handleClose = vi.fn();
    render(
      <JsonPathHistoryModal
        isOpen={true}
        history={mockHistory}
        onClose={handleClose}
        onReuse={() => {}}
        onDelete={() => {}}
        onClearAll={() => {}}
      />,
    );

    const closeButton = screen.getByLabelText("Cerrar modal");
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledOnce();
  });

  it("should call onReuse when history item is clicked", () => {
    const handleReuse = vi.fn();
    render(
      <JsonPathHistoryModal
        isOpen={true}
        history={mockHistory}
        onClose={() => {}}
        onReuse={handleReuse}
        onDelete={() => {}}
        onClearAll={() => {}}
      />,
    );

    const firstExpression = screen.getByText("$.users[*].name");
    fireEvent.click(firstExpression);

    expect(handleReuse).toHaveBeenCalledWith("$.users[*].name");
  });

  it("should call onReuse when reuse button is clicked", () => {
    const handleReuse = vi.fn();
    render(
      <JsonPathHistoryModal
        isOpen={true}
        history={mockHistory}
        onClose={() => {}}
        onReuse={handleReuse}
        onDelete={() => {}}
        onClearAll={() => {}}
      />,
    );

    const reuseButtons = screen.getAllByLabelText("Reutilizar filtro");
    fireEvent.click(reuseButtons[0]);

    expect(handleReuse).toHaveBeenCalledWith("$.users[*].name");
  });

  it("should call onDelete when delete button is clicked", () => {
    const handleDelete = vi.fn();
    render(
      <JsonPathHistoryModal
        isOpen={true}
        history={mockHistory}
        onClose={() => {}}
        onReuse={() => {}}
        onDelete={handleDelete}
        onClearAll={() => {}}
      />,
    );

    const deleteButtons = screen.getAllByLabelText("Borrar filtro");
    fireEvent.click(deleteButtons[0]);

    expect(handleDelete).toHaveBeenCalledWith("1");
  });

  it("should call onClearAll when clear history button is clicked", () => {
    const handleClearAll = vi.fn();
    render(
      <JsonPathHistoryModal
        isOpen={true}
        history={mockHistory}
        onClose={() => {}}
        onReuse={() => {}}
        onDelete={() => {}}
        onClearAll={handleClearAll}
      />,
    );

    const clearButton = screen.getByText("Borrar Historial");
    fireEvent.click(clearButton);

    expect(handleClearAll).toHaveBeenCalledOnce();
  });

  it("should display timestamps for history items", () => {
    render(
      <JsonPathHistoryModal
        isOpen={true}
        history={mockHistory}
        onClose={() => {}}
        onReuse={() => {}}
        onDelete={() => {}}
        onClearAll={() => {}}
      />,
    );

    // Check that dates are rendered (locale string format)
    const timestamps = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
    expect(timestamps.length).toBeGreaterThan(0);
  });
});
