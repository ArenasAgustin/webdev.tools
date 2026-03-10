import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { JsonEditors } from "./JsonEditors";

interface PanelMockProps {
  title: string;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

interface LazyCodeEditorMockProps {
  value?: string;
  placeholder?: string;
}

const mockExpand = vi.fn();
const mockCollapse = vi.fn();
let expandedState: "input" | "output" | null = null;

vi.mock("@/hooks/useExpandedEditor", () => ({
  useExpandedEditor: () => ({
    expanded: expandedState,
    isExpanded: (type: "input" | "output") => expandedState === type,
    expand: mockExpand,
    collapse: mockCollapse,
    toggle: vi.fn(),
  }),
}));

vi.mock("@/hooks/useTextStats", () => ({
  useTextStats: () => ({ lines: 2, characters: 10, bytes: 10 }),
}));

vi.mock("@/components/layout/Panel", () => ({
  Panel: ({ title, actions, footer, children }: PanelMockProps) => (
    <section>
      <h2>{title}</h2>
      <div>{actions}</div>
      <div>{children}</div>
      <div>{footer}</div>
    </section>
  ),
}));

vi.mock("@/components/editor/LazyCodeEditor", () => ({
  LazyCodeEditor: ({ value, placeholder }: LazyCodeEditorMockProps) => (
    <div data-testid="lazy-editor">{value ?? placeholder}</div>
  ),
}));

vi.mock("@/components/editor/ExpandedEditorModal", () => ({
  ExpandedEditorModal: ({ title }: { title: string }) => <div>{title} modal</div>,
}));

vi.mock("@/components/editor/InputActions", () => ({
  InputActions: ({ onExpand }: { onExpand: () => void }) => (
    <button onClick={onExpand}>expand-input</button>
  ),
}));

vi.mock("@/components/editor/OutputActions", () => ({
  OutputActions: ({ onExpand }: { onExpand: () => void }) => (
    <button onClick={onExpand}>expand-output</button>
  ),
}));

vi.mock("@/components/common/Stats", () => ({
  Stats: () => <div>stats</div>,
}));

vi.mock("@/components/common/ValidationStatus", () => ({
  ValidationStatus: ({ warning }: { warning?: string | null }) => <div>{warning}</div>,
}));

vi.mock("@/components/common/OutputStatus", () => ({
  OutputStatus: ({ validExtra }: { validExtra?: ReactNode }) => <div>{validExtra}</div>,
}));

describe("JsonEditors", () => {
  beforeEach(() => {
    expandedState = null;
    vi.clearAllMocks();
  });

  const baseProps = {
    inputJson: '{"ok":true}',
    outputJson: '{"ok": true}',
    validationState: {
      isValid: true,
      error: null,
    },
    outputError: null,
    inputWarning: "warning",
    onInputChange: vi.fn(),
    onClearInput: vi.fn(),
    onLoadExample: vi.fn(),
    onCopyOutput: vi.fn(),
    onDownloadInput: vi.fn(),
    onDownloadOutput: vi.fn(),
  };

  it("renders both panels and triggers expand actions", () => {
    render(<JsonEditors {...baseProps} />);

    expect(screen.getAllByText("JSON").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Resultado").length).toBeGreaterThan(0);
    expect(screen.getByText("warning")).toBeInTheDocument();

    fireEvent.click(screen.getByText("expand-input"));
    fireEvent.click(screen.getByText("expand-output"));

    expect(mockExpand).toHaveBeenCalledWith("input");
    expect(mockExpand).toHaveBeenCalledWith("output");
  });

  it("renders expanded modals for input and output states", () => {
    expandedState = "input";
    const { rerender } = render(<JsonEditors {...baseProps} />);
    expect(screen.getByText("JSON modal")).toBeInTheDocument();

    expandedState = "output";
    rerender(<JsonEditors {...baseProps} outputJson="changed" />);
    expect(screen.getByText("Resultado modal")).toBeInTheDocument();
  });
});
