import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RadioGroup } from "./RadioGroup";

describe("RadioGroup", () => {
  it("names the group with its visible label, not the input name", () => {
    render(
      <RadioGroup
        name="cleanOutputMode"
        label="Output format"
        value="format"
        options={[
          { value: "format", label: "Format" },
          { value: "minify", label: "Minify" },
        ]}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("group", { name: "Output format" })).toBeInTheDocument();
    expect(screen.queryByText("cleanOutputMode")).not.toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Format" })).toBeChecked();
  });
});
