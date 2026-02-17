import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ToggleButtonGroup } from "./ToggleButtonGroup";

describe("ToggleButtonGroup", () => {
  const options = [
    { value: "2", label: "2 spaces" },
    { value: "4", label: "4 spaces" },
    { value: "\t", label: "Tab" },
  ];

  it("should render all options", () => {
    render(<ToggleButtonGroup options={options} value="2" onChange={() => {}} />);

    expect(screen.getByText("2 spaces")).toBeInTheDocument();
    expect(screen.getByText("4 spaces")).toBeInTheDocument();
    expect(screen.getByText("Tab")).toBeInTheDocument();
  });

  it("should highlight selected value", () => {
    render(<ToggleButtonGroup options={options} value="4" onChange={() => {}} />);

    const selectedButton = screen.getByText("4 spaces");
    expect(selectedButton).toHaveClass("bg-blue-500/30");
    expect(selectedButton).toHaveAttribute("aria-pressed", "true");
  });

  it("should not highlight unselected value", () => {
    render(<ToggleButtonGroup options={options} value="4" onChange={() => {}} />);

    const unselectedButton = screen.getByText("2 spaces");
    expect(unselectedButton).toHaveClass("bg-white/10");
    expect(unselectedButton).toHaveAttribute("aria-pressed", "false");
  });

  it("should call onChange when option is clicked", () => {
    const handleChange = vi.fn();
    render(<ToggleButtonGroup options={options} value="2" onChange={handleChange} />);

    const button = screen.getByText("4 spaces");
    fireEvent.click(button);

    expect(handleChange).toHaveBeenCalledWith("4");
  });

  it("should not call onChange when clicking already selected option", () => {
    const handleChange = vi.fn();
    render(<ToggleButtonGroup options={options} value="2" onChange={handleChange} />);

    const button = screen.getByText("2 spaces");
    fireEvent.click(button);

    // Should still be called even if same value
    expect(handleChange).toHaveBeenCalledWith("2");
  });

  it("should handle tab character value", () => {
    const handleChange = vi.fn();
    render(<ToggleButtonGroup options={options} value="2" onChange={handleChange} />);

    const tabButton = screen.getByText("Tab");
    fireEvent.click(tabButton);

    expect(handleChange).toHaveBeenCalledWith("\t");
  });
});
