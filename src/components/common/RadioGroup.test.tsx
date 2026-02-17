import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RadioGroup } from "./RadioGroup";

describe("RadioGroup", () => {
  const options = [
    { value: "option1", label: "First Option" },
    { value: "option2", label: "Second Option" },
    { value: "option3", label: "Third Option" },
  ];

  it("should render all radio options", () => {
    render(<RadioGroup name="test-group" options={options} value="option1" onChange={() => {}} />);

    options.forEach((option) => {
      expect(screen.getByLabelText(option.label)).toBeInTheDocument();
    });
  });

  it("should select the correct option", () => {
    render(<RadioGroup name="test-group" options={options} value="option2" onChange={() => {}} />);

    const selectedRadio = screen.getByLabelText("Second Option");
    expect(selectedRadio).toBeChecked();
  });

  it("should not check unselected options", () => {
    render(<RadioGroup name="test-group" options={options} value="option2" onChange={() => {}} />);

    const firstRadio = screen.getByLabelText("First Option");
    const thirdRadio = screen.getByLabelText("Third Option");

    expect(firstRadio).not.toBeChecked();
    expect(thirdRadio).not.toBeChecked();
  });

  it("should call onChange when option is clicked", () => {
    const handleChange = vi.fn();
    render(
      <RadioGroup name="test-group" options={options} value="option1" onChange={handleChange} />,
    );

    const radio = screen.getByLabelText("Third Option");
    fireEvent.click(radio);

    expect(handleChange).toHaveBeenCalledWith("option3");
  });

  it("should use the provided name attribute", () => {
    render(
      <RadioGroup name="my-custom-name" options={options} value="option1" onChange={() => {}} />,
    );

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const radios = screen.getAllByRole("radio") as HTMLInputElement[];
    radios.forEach((radio) => {
      expect(radio.name).toBe("my-custom-name");
    });
  });

  it("should work with single option", () => {
    const singleOption = [{ value: "only", label: "Only Option" }];
    render(<RadioGroup name="single" options={singleOption} value="only" onChange={() => {}} />);

    const radio = screen.getByLabelText("Only Option");
    expect(radio).toBeChecked();
  });

  it("should render radiogroup role with accessible name", () => {
    render(
      <RadioGroup name="access-group" options={options} value="option1" onChange={() => {}} />,
    );

    expect(screen.getByRole("radiogroup", { name: "access-group" })).toBeInTheDocument();
  });

  it("should apply default blue color classes when color is not provided", () => {
    render(
      <RadioGroup name="default-color" options={options} value="option1" onChange={() => {}} />,
    );

    const firstRadio = screen.getByLabelText("First Option");
    expect(firstRadio).toHaveClass("text-blue-500");
    expect(firstRadio).toHaveClass("focus:ring-blue-500");
  });

  it("should apply custom color classes", () => {
    render(
      <RadioGroup
        name="custom-color"
        options={options}
        value="option1"
        onChange={() => {}}
        color="orange"
      />,
    );

    const firstRadio = screen.getByLabelText("First Option");
    expect(firstRadio).toHaveClass("text-orange-500");
    expect(firstRadio).toHaveClass("focus:ring-orange-500");
  });

  it("should append custom className to container", () => {
    render(
      <RadioGroup
        name="custom-class"
        options={options}
        value="option1"
        onChange={() => {}}
        className="mt-2 custom-group"
      />,
    );

    const group = screen.getByRole("radiogroup", { name: "custom-class" });
    expect(group).toHaveClass("flex");
    expect(group).toHaveClass("gap-4");
    expect(group).toHaveClass("mt-2");
    expect(group).toHaveClass("custom-group");
  });

  it("should update checked option after rerender", () => {
    const { rerender } = render(
      <RadioGroup name="rerender-group" options={options} value="option1" onChange={() => {}} />,
    );

    expect(screen.getByLabelText("First Option")).toBeChecked();
    expect(screen.getByLabelText("Second Option")).not.toBeChecked();

    rerender(
      <RadioGroup name="rerender-group" options={options} value="option2" onChange={() => {}} />,
    );

    expect(screen.getByLabelText("First Option")).not.toBeChecked();
    expect(screen.getByLabelText("Second Option")).toBeChecked();
  });

  it("should render empty group when options are empty", () => {
    render(<RadioGroup name="empty-group" options={[]} value={"" as never} onChange={() => {}} />);

    expect(screen.getByRole("radiogroup", { name: "empty-group" })).toBeInTheDocument();
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
  });
});
