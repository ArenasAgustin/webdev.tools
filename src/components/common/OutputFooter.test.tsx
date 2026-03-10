import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OutputFooter } from "./OutputFooter";

const outputStats = { lines: 3, characters: 80, bytes: 80 };

describe("OutputFooter", () => {
  it("renders waiting message when output is empty", () => {
    render(<OutputFooter output="" error={null} outputStats={outputStats} comparisonBytes={100} />);

    expect(screen.getByText("Esperando operación...")).toBeInTheDocument();
  });

  it("renders error message when error is present", () => {
    render(
      <OutputFooter
        output=""
        error="Format failed"
        outputStats={outputStats}
        comparisonBytes={100}
      />,
    );

    expect(screen.getByText(/Format failed/)).toBeInTheDocument();
  });

  it("renders stats with comparison when output has content", () => {
    render(
      <OutputFooter
        output="body{color:red}"
        error={null}
        outputStats={outputStats}
        comparisonBytes={100}
      />,
    );

    expect(screen.getByText(/3 líneas/)).toBeInTheDocument();
    expect(screen.getByText(/80 caracteres/)).toBeInTheDocument();
    expect(screen.getByText(/80 bytes/)).toBeInTheDocument();
    expect(screen.getByText(/20%/)).toBeInTheDocument();
  });
});
