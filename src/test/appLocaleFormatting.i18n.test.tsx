import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import i18n from "i18next";
import { Stats } from "@/components/common/Stats";
import { JsonPathHistoryModal } from "@/components/common/JsonPathHistoryModal";

const TIMESTAMP = Date.UTC(2026, 9, 29, 15, 4, 5);

// Numbers and dates follow the app language, not the browser/OS locale.
describe("formatting follows the app language", () => {
  afterEach(async () => {
    await act(() => i18n.changeLanguage("es"));
  });

  it.each([
    ["es", "12.345"],
    ["en", "12,345"],
  ])("Stats groups the character count for %s", async (lng, expected) => {
    await act(() => i18n.changeLanguage(lng));
    const { container } = render(<Stats lines={1} characters={12345} bytes={10} />);
    expect(container.textContent).toContain(expected);
  });

  it.each(["es", "en"])("JSONPath history dates use the %s format", async (lng) => {
    await act(() => i18n.changeLanguage(lng));
    render(
      <JsonPathHistoryModal
        isOpen
        history={[{ id: "1", expression: "$.a", timestamp: TIMESTAMP, frequency: 1 }]}
        onClose={vi.fn()}
        onReuse={vi.fn()}
        onDelete={vi.fn()}
        onClearAll={vi.fn()}
      />,
    );
    expect(screen.getByText(new Date(TIMESTAMP).toLocaleString(lng))).toBeInTheDocument();
  });
});
