import { describe, it, expect, afterEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { JsonPathHistoryModal } from "./JsonPathHistoryModal";
import type { JsonPathHistoryItem } from "@/hooks/useJsonPathHistory";
import { renderWithI18n, cleanupI18n } from "@/test/test-utils";

// Recursos de i18n para este test
const i18nResources = {
  "jsonpath.history_title": "Historial de Filtros",
  "jsonpath.no_history": "No hay historial reciente",
  "jsonpath.close": "Cerrar modal",
  "jsonpath.reuse": "Reutilizar filtro",
  "jsonpath.delete": "Borrar filtro",
  "jsonpath.clear_all": "Borrar Historial",
};

// Limpiar i18n después de cada test
afterEach(async () => {
  await cleanupI18n();
});

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
    renderWithI18n(
      <JsonPathHistoryModal
        isOpen={false}
        history={mockHistory}
        onClose={() => {}}
        onReuse={() => {}}
        onDelete={() => {}}
        onClearAll={() => {}}
      />,
      i18nResources
    );

    expect(screen.queryByText("Historial de Filtros")).not.toBeInTheDocument();
  });

  it("should render when open", () => {
    renderWithI18n(
      <JsonPathHistoryModal
        isOpen={true}
        history={mockHistory}
        onClose={() => {}}
        onReuse={() => {}}
        onDelete={() => {}}
        onClearAll={handleClearAll}
      />,
      i18nResources
    );

    const clearButton = screen.getByText("Borrar Historial");
    fireEvent.click(clearButton);

    expect(handleClearAll).toHaveBeenCalledOnce();
  });

  it("should display timestamps for history items", () => {
    renderWithI18n(
      <JsonPathHistoryModal
        isOpen={true}
        history={mockHistory}
        onClose={() => {}}
        onReuse={() => {}}
        onDelete={() => {}}
        onClearAll={() => {}}
      />,
      i18nResources
    );

    // Check that dates are rendered (locale string format)
    const timestamps = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
    expect(timestamps.length).toBeGreaterThan(0);
  });
});
