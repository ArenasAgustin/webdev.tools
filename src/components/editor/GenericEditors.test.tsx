import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { GenericEditors } from "./GenericEditors";

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

vi.mock("@/components/common/EditorFooter", () => ({
  EditorFooter: ({ variant, warning }: { variant: string; warning?: string | null }) => (
    <div>
      {variant}-footer{warning && <span>{warning}</span>}
    </div>
  ),
}));

// Base props (CSS) for feature-specific tests
const baseProps = {
  input: "some input",
  output: "some output",
  error: null,
  validationState: { isValid: true, error: null },
  inputWarning: "test-warning",
  language: "css",
  inputTitle: "CSS",
  inputPlaceholder: "Write CSS...",
  waitingLabel: "Waiting...",
  validLabel: "Valid",
  invalidLabel: "Invalid",
  onInputChange: vi.fn(),
  onClearInput: vi.fn(),
  onLoadExample: vi.fn(),
  onCopyOutput: vi.fn(),
  onDownloadInput: vi.fn(),
  onDownloadOutput: vi.fn(),
};

describe("GenericEditors — features", () => {
  beforeEach(() => {
    expandedState = null;
    vi.clearAllMocks();
  });

  it("renders input and output panels with correct titles", () => {
    render(<GenericEditors {...baseProps} />);

    expect(screen.getAllByText("CSS").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Resultado").length).toBeGreaterThan(0);
  });

  it("renders footers in panels", () => {
    render(<GenericEditors {...baseProps} />);

    expect(screen.getAllByText(/input-footer/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("output-footer").length).toBeGreaterThan(0);
  });

  it("triggers expand actions", () => {
    render(<GenericEditors {...baseProps} />);

    fireEvent.click(screen.getByText("expand-input"));
    fireEvent.click(screen.getByText("expand-output"));

    expect(mockExpand).toHaveBeenCalledWith("input");
    expect(mockExpand).toHaveBeenCalledWith("output");
  });

  it("renders expanded input modal", () => {
    expandedState = "input";
    render(<GenericEditors {...baseProps} />);
    expect(screen.getByText("CSS modal")).toBeInTheDocument();
  });

  it("renders expanded output modal", () => {
    expandedState = "output";
    render(<GenericEditors {...baseProps} />);
    expect(screen.getByText("Resultado modal")).toBeInTheDocument();
  });

  it("renders extraOutputActions when provided", () => {
    render(<GenericEditors {...baseProps} extraOutputActions={<button>extra-action</button>} />);

    expect(screen.getAllByText("extra-action").length).toBeGreaterThan(0);
  });

  it("uses custom outputPanel when provided", () => {
    render(<GenericEditors {...baseProps} outputPanel={() => <div>custom-output</div>} />);

    expect(screen.getByText("custom-output")).toBeInTheDocument();
    expect(screen.queryByText("Resultado")).not.toBeInTheDocument();
  });
});

// --- Parametrized tests: each playground language config ---
const LANGUAGE_CONFIGS = [
  {
    language: "css",
    inputTitle: "CSS",
    inputPlaceholder: "Escribe tu CSS aquí...",
    waitingLabel: "Esperando CSS...",
    validLabel: "CSS válido",
    invalidLabel: "CSS inválido",
    input: ".card { color: red; }",
  },
  {
    language: "javascript",
    inputTitle: "JavaScript",
    inputPlaceholder: "Escribe tu código JavaScript aquí...",
    waitingLabel: "Esperando JavaScript...",
    validLabel: "JavaScript válido",
    invalidLabel: "JavaScript inválido",
    input: "const a = 1;",
  },
  {
    language: "json",
    inputTitle: "JSON",
    inputPlaceholder: "Pega tu JSON aquí...",
    waitingLabel: "Esperando JSON...",
    validLabel: "JSON válido",
    invalidLabel: "JSON inválido",
    input: '{"ok":true}',
  },
  {
    language: "html",
    inputTitle: "HTML",
    inputPlaceholder: "Escribe tu HTML aquí...",
    waitingLabel: "Esperando HTML...",
    validLabel: "HTML válido",
    invalidLabel: "HTML inválido",
    input: "<div>ok</div>",
  },
] as const;

describe.each(LANGUAGE_CONFIGS)(
  "GenericEditors — $inputTitle",
  ({ language, inputTitle, inputPlaceholder, waitingLabel, validLabel, invalidLabel, input }) => {
    beforeEach(() => {
      expandedState = null;
      vi.clearAllMocks();
    });

    const makeProps = () => ({
      input,
      output: "output text",
      error: null,
      validationState: { isValid: true, error: null },
      inputWarning: "warning",
      language,
      inputTitle,
      inputPlaceholder,
      waitingLabel,
      validLabel,
      invalidLabel,
      onInputChange: vi.fn(),
      onClearInput: vi.fn(),
      onLoadExample: vi.fn(),
      onCopyOutput: vi.fn(),
      onDownloadInput: vi.fn(),
      onDownloadOutput: vi.fn(),
    });

    it("renders both panels and triggers expand actions", () => {
      render(<GenericEditors {...makeProps()} />);

      expect(screen.getAllByText(inputTitle).length).toBeGreaterThan(0);
      expect(screen.getAllByText("Resultado").length).toBeGreaterThan(0);
      expect(screen.getByText("warning")).toBeInTheDocument();

      fireEvent.click(screen.getByText("expand-input"));
      fireEvent.click(screen.getByText("expand-output"));

      expect(mockExpand).toHaveBeenCalledWith("input");
      expect(mockExpand).toHaveBeenCalledWith("output");
    });

    it("renders expanded modals for input and output states", () => {
      expandedState = "input";
      const { rerender } = render(<GenericEditors {...makeProps()} />);
      expect(screen.getByText(`${inputTitle} modal`)).toBeInTheDocument();

      expandedState = "output";
      rerender(<GenericEditors {...makeProps()} output="changed" />);
      expect(screen.getByText("Resultado modal")).toBeInTheDocument();
    });
  },
);
