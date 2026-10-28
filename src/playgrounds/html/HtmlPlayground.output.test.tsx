import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { render, screen, fireEvent, act, within } from "@testing-library/react";
import type { OutputPanelProps } from "../engines/types";

const { formatHtmlMock } = vi.hoisted(() => ({ formatHtmlMock: vi.fn() }));

vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }),
}));

vi.mock("@/hooks/useHtmlParser", () => ({
  useHtmlParser: () => ({ isValid: true, error: null }),
}));

vi.mock("@/services/storage", () => ({
  loadLastHtml: vi.fn(() => "<p>a</p>"),
  saveLastHtml: vi.fn(),
  loadHtmlToolsConfig: vi.fn(() => null),
  saveHtmlToolsConfig: vi.fn(),
}));

vi.mock("@/services/html/service", () => ({
  htmlService: { format: formatHtmlMock, minify: vi.fn(), validate: vi.fn() },
}));

vi.mock("@/components/editor/LazyCodeEditor", () => ({
  LazyCodeEditor: ({ value }: { value: string }) => <pre data-testid="code">{value}</pre>,
}));

// Minimal stand-in for GenericEditors: renders the custom output panel and an
// "expanded output" modal that holds the extra output actions, like the real one.
vi.mock("@/components/editor/GenericEditors", () => ({
  GenericEditors: (props: {
    input: string;
    output: string;
    error: string | null;
    isProcessing?: boolean;
    extraOutputActions?: ReactNode;
    editorState: { isExpanded: (type: "output") => boolean; expand: (type: "output") => void };
    outputPanel: (props: OutputPanelProps) => ReactNode;
  }) => (
    <div>
      <button onClick={() => props.editorState.expand("output")}>open-modal</button>
      {props.editorState.isExpanded("output") && (
        <div data-testid="expanded-modal">{props.extraOutputActions}</div>
      )}
      {props.outputPanel({
        input: props.input,
        output: props.output,
        error: props.error,
        isProcessing: props.isProcessing ?? false,
        outputStats: { lines: 0, characters: 0, bytes: 0 },
        comparisonBytes: 0,
        expandOutput: () => props.editorState.expand("output"),
        onCopyOutput: vi.fn(),
        onDownloadOutput: vi.fn(),
      })}
    </div>
  ),
}));

import { HtmlPlayground } from "./HtmlPlayground";

describe("HtmlPlayground output panel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hides the output actions while there is no output", () => {
    render(<HtmlPlayground />);

    expect(screen.queryByRole("button", { name: "Copiar resultado" })).toBeNull();
  });

  it("closes the expanded modal and shows the preview from the modal's eye button", () => {
    render(<HtmlPlayground />);

    fireEvent.click(screen.getByRole("button", { name: "open-modal" }));
    const modal = screen.getByTestId("expanded-modal");
    fireEvent.click(within(modal).getByRole("button", { name: "Ver vista previa" }));

    expect(screen.queryByTestId("expanded-modal")).toBeNull();
    expect(screen.getByTitle("Vista previa")).toBeInTheDocument();
  });

  it("shows the processing state in the output footer while formatting", async () => {
    formatHtmlMock.mockReturnValue(new Promise(() => undefined));
    render(<HtmlPlayground />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Formatear" }));
      await Promise.resolve();
    });

    expect(screen.getAllByText(/Procesando/).length).toBeGreaterThan(0);
  });
});
