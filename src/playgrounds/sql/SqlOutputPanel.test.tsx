import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SqlOutputPanel } from "./SqlOutputPanel";

// A cap different from the real one proves the banner reads ROW_CAP instead of a literal.
vi.mock("@/services/sql/worker.types", () => ({ ROW_CAP: 25 }));

vi.mock("@/components/editor/LazyCodeEditor", () => ({
  LazyCodeEditor: ({ value, language }: { value: string; language: string }) => (
    <div data-testid={`code-editor-${language}`}>{value}</div>
  ),
}));

function renderPanel(output: string) {
  return render(
    <SqlOutputPanel
      input=""
      output={output}
      error={null}
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
  });
});
