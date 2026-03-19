import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlaygroundLayout } from "./PlaygroundLayout";

describe("PlaygroundLayout", () => {
  it("renders editors and toolbar slots", () => {
    render(
      <PlaygroundLayout
        editors={<div>Editors content</div>}
        toolbar={<div>Toolbar content</div>}
      />,
    );

    expect(screen.getByText("Editors content")).toBeInTheDocument();
    expect(screen.getByText("Toolbar content")).toBeInTheDocument();
  });

  it("renders optional panel slot when provided", () => {
    render(
      <PlaygroundLayout
        editors={<div>Editors</div>}
        toolbar={<div>Toolbar</div>}
        panel={<div>Panel content</div>}
      />,
    );

    expect(screen.getByText("Panel content")).toBeInTheDocument();
  });

  it("does not render panel area when omitted", () => {
    render(
      <PlaygroundLayout editors={<div>Editors</div>} toolbar={<div>Toolbar</div>} />,
    );

    expect(screen.queryByText("Panel content")).not.toBeInTheDocument();
  });
});
