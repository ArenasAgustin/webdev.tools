import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SqlOutputPanel } from "./SqlOutputPanel";

// A cap different from the real one proves the banner reads ROW_CAP instead of a literal.
vi.mock("@/services/sql/worker.types", () => ({ ROW_CAP: 25, CELL_CAP: 77 }));

vi.mock("@/components/editor/LazyCodeEditor", () => ({
  LazyCodeEditor: ({ value, language }: { value: string; language: string }) => (
    <div data-testid={`code-editor-${language}`}>{value}</div>
  ),
}));

function renderPanel(output: string, error: string | null = null) {
  return render(
    <SqlOutputPanel
      input=""
      output={output}
      error={error}
      isProcessing={false}
      outputStats={{ lines: 1, characters: output.length, bytes: output.length }}
      comparisonBytes={0}
      expandOutput={vi.fn()}
      onCopyOutput={vi.fn()}
      onDownloadOutput={vi.fn()}
      onUseOutputAsInput={vi.fn()}
      actions={{ isExecuting: false, isFirstRun: false }}
    />,
  );
}

describe("SqlOutputPanel", () => {
  it("shows the row cap from ROW_CAP in the truncation banner", () => {
    renderPanel(JSON.stringify({ resultSets: [{ statement: 1, columns: ["a"], rows: [[1]], truncated: true }], elapsedMs: 1, truncated: true }));
    expect(screen.getByTestId("sql-truncation-banner")).toHaveTextContent("25");
    expect(screen.queryByTestId("sql-values-truncated-banner")).toBeNull();
  });

  it("explains that long values were cut, with the cell cap", () => {
    renderPanel(JSON.stringify({ resultSets: [{ statement: 1, columns: ["a"], rows: [["x…"]], truncated: false, valuesTruncated: true }], elapsedMs: 1, truncated: false, valuesTruncated: true }));
    expect(screen.getByTestId("sql-values-truncated-banner")).toHaveTextContent("77");
    expect(screen.queryByTestId("sql-truncation-banner")).toBeNull();
  });

  it("shows the error together with the results of the statements that ran before it", () => {
    const output = JSON.stringify({ resultSets: [{ statement: 1, columns: ["a"], rows: [[1]], truncated: false }], elapsedMs: 1, truncated: false });
    renderPanel(output, "Sentencia 2: no such table: nope");
    expect(screen.getByTestId("sql-error-banner")).toHaveTextContent("Sentencia 2: no such table: nope");
    expect(screen.getByTestId("code-editor-json")).toHaveTextContent('"statement":1');
  });
});
