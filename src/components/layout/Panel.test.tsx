import { describe, it, expect } from "vitest";
import { renderWithI18n } from "@/test/test-utils";
import { Panel } from "./Panel";

describe("Panel", () => {
  it("renders title and children", () => {
    const { getByText } = renderWithI18n(
      <Panel title="CSS Editor" icon="code">
        <div>Editor content</div>
      </Panel>,
    );

    expect(getByText("CSS Editor")).toBeInTheDocument();
    expect(getByText("Editor content")).toBeInTheDocument();
  });

  it("renders actions when provided", () => {
    const { getByText } = renderWithI18n(
      <Panel title="Test" icon="code" actions={<button>Copy</button>}>
        content
      </Panel>,
    );

    expect(getByText("Copy")).toBeInTheDocument();
  });

  it("renders footer when provided", () => {
    const { getByText } = renderWithI18n(
      <Panel title="Test" icon="code" footer={<span>3 líneas</span>}>
        content
      </Panel>,
    );

    expect(getByText("3 líneas")).toBeInTheDocument();
  });

  it("does not render dialog role (panel variant)", () => {
    const { queryByRole } = renderWithI18n(
      <Panel title="Test" icon="code">
        content
      </Panel>,
    );

    expect(queryByRole("dialog")).not.toBeInTheDocument();
  });
});
