import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ToggleButtonGroup } from "./ToggleButtonGroup";

const DEFAULT_ACTIVE =
  "flex-1 p-2 bg-blue-500/30 border border-blue-500/50 rounded text-white transition-colors";
const DEFAULT_INACTIVE =
  "flex-1 p-2 bg-white/10 border border-white/20 rounded text-gray-400 hover:text-white transition-colors";

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma" },
] as const;

describe("ToggleButtonGroup", () => {
  describe("pressed state", () => {
    it("marks only the selected option as pressed", () => {
      render(<ToggleButtonGroup options={options} value="b" onChange={vi.fn()} />);
      expect(screen.getByRole("button", { name: "Alpha", pressed: false })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Beta", pressed: true })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Gamma", pressed: false })).toBeInTheDocument();
    });

    it("moves the pressed state on rerender", () => {
      const { rerender } = render(
        <ToggleButtonGroup options={options} value="a" onChange={vi.fn()} />,
      );
      rerender(<ToggleButtonGroup options={options} value="c" onChange={vi.fn()} />);
      expect(screen.getByRole("button", { name: "Gamma", pressed: true })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Alpha", pressed: false })).toBeInTheDocument();
    });

    it("renders every button with type=button", () => {
      render(<ToggleButtonGroup options={options} value="a" onChange={vi.fn()} />);
      for (const button of screen.getAllByRole("button")) {
        expect(button).toHaveAttribute("type", "button");
      }
    });
  });

  describe("onChange", () => {
    it("calls onChange with the string value", () => {
      const onChange = vi.fn();
      render(<ToggleButtonGroup options={options} value="a" onChange={onChange} />);
      fireEvent.click(screen.getByRole("button", { name: "Beta" }));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith("b");
    });

    it("calls onChange with the numeric value without coercion", () => {
      const onChange = vi.fn();
      render(
        <ToggleButtonGroup
          options={[
            { value: 1, label: "One" },
            { value: 2, label: "Two" },
          ]}
          value={1}
          onChange={onChange}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Two" }));
      expect(onChange).toHaveBeenCalledWith(2);
    });
  });

  describe("group accessible name", () => {
    it("sets aria-label on the group", () => {
      render(<ToggleButtonGroup options={options} value="a" onChange={vi.fn()} ariaLabel="Mode" />);
      expect(screen.getByRole("group", { name: "Mode" })).toBeInTheDocument();
    });

    it("omits aria-label when not provided", () => {
      render(<ToggleButtonGroup options={options} value="a" onChange={vi.fn()} />);
      expect(screen.getByRole("group")).not.toHaveAttribute("aria-label");
    });
  });

  describe("ReactNode labels", () => {
    it("renders a ReactNode label and exposes its accessible name", () => {
      render(
        <ToggleButtonGroup
          options={[
            { value: "auto", label: <span>Auto (JSON)</span> },
            { value: "x", label: "Other" },
          ]}
          value="auto"
          onChange={vi.fn()}
        />,
      );
      expect(screen.getByRole("button", { name: /auto/i })).toBeInTheDocument();
      expect(screen.getByText("Auto (JSON)").tagName).toBe("SPAN");
    });
  });

  describe("default variant", () => {
    it("keeps the legacy blue classes", () => {
      render(<ToggleButtonGroup options={options} value="a" onChange={vi.fn()} />);
      expect(screen.getByRole("button", { name: "Alpha" })).toHaveClass(
        ...DEFAULT_ACTIVE.split(" "),
      );
      expect(screen.getByRole("button", { name: "Beta" })).toHaveClass(
        ...DEFAULT_INACTIVE.split(" "),
      );
    });

    it("lets activeClassName and inactiveClassName override the variant", () => {
      render(
        <ToggleButtonGroup
          options={options}
          value="a"
          onChange={vi.fn()}
          activeClassName="x-active"
          inactiveClassName="x-inactive"
        />,
      );
      const active = screen.getByRole("button", { name: "Alpha" });
      const inactive = screen.getByRole("button", { name: "Beta" });
      expect(active).toHaveClass("x-active");
      expect(active).not.toHaveClass("bg-blue-500/30");
      expect(inactive).toHaveClass("x-inactive");
      expect(inactive).not.toHaveClass("bg-white/10");
    });
  });

  describe("segmented variant", () => {
    it("applies cyan segmented classes", () => {
      render(
        <ToggleButtonGroup options={options} value="a" onChange={vi.fn()} variant="segmented" />,
      );
      const active = screen.getByRole("button", { name: "Alpha" });
      const inactive = screen.getByRole("button", { name: "Beta" });
      expect(active).toHaveClass(
        "bg-cyan-500",
        "text-white",
        "px-4",
        "py-2",
        "rounded-lg",
        "font-medium",
      );
      expect(active).not.toHaveClass("bg-blue-500/30");
      expect(inactive).toHaveClass("bg-white/10", "text-gray-300", "hover:bg-white/20");
      expect(inactive).not.toHaveClass("bg-cyan-500");
    });
  });

  describe("focus visibility", () => {
    it.each(["default", "segmented"] as const)(
      "adds a focus-visible ring in %s variant",
      (variant) => {
        render(
          <ToggleButtonGroup options={options} value="a" onChange={vi.fn()} variant={variant} />,
        );
        for (const button of screen.getAllByRole("button")) {
          expect(button).toHaveClass("focus-visible:ring-2");
        }
      },
    );
  });
});
