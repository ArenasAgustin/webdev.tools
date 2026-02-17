import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("should render with label", () => {
    render(<Checkbox label="Enable feature" checked={false} onChange={() => {}} />);

    expect(screen.getByText("Enable feature")).toBeInTheDocument();
  });

  it("should show checked state", () => {
    render(<Checkbox label="Enable feature" checked={true} onChange={() => {}} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("should show unchecked state", () => {
    render(<Checkbox label="Enable feature" checked={false} onChange={() => {}} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("should call onChange when clicked", () => {
    const handleChange = vi.fn();
    render(<Checkbox label="Enable feature" checked={false} onChange={handleChange} />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("should toggle from checked to unchecked", () => {
    const handleChange = vi.fn();
    render(<Checkbox label="Enable feature" checked={true} onChange={handleChange} />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it("should be clickable via label", () => {
    const handleChange = vi.fn();
    render(<Checkbox label="Enable feature" checked={false} onChange={handleChange} />);

    const label = screen.getByText("Enable feature");
    fireEvent.click(label);

    expect(handleChange).toHaveBeenCalledWith(true);
  });
});
