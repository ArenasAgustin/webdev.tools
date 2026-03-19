import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Panel } from "./Panel";

describe("Panel", () => {
  it("renders title and children", () => {
    render(<Panel title="CSS Editor" icon="code"><div>Editor content</div></Panel>);

    expect(screen.getByText("CSS Editor")).toBeInTheDocument();
    expect(screen.getByText("Editor content")).toBeInTheDocument();
  });

  it("renders actions when provided", () => {
    render(
      <Panel title="Test" icon="code" actions={<button>Copy</button>}>
        content
      </Panel>,
    );

    expect(screen.getByText("Copy")).toBeInTheDocument();
  });

  it("renders footer when provided", () => {
    render(
      <Panel title="Test" icon="code" footer={<span>3 líneas</span>}>
        content
      </Panel>,
    );

    expect(screen.getByText("3 líneas")).toBeInTheDocument();
  });

  it("does not render dialog role (panel variant)", () => {
    render(<Panel title="Test" icon="code">content</Panel>);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
