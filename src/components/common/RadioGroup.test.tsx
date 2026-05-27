import { describe, it, expect, vi } from "vitest";
import { renderWithI18n } from "@/test/test-utils";
import { screen, fireEvent } from "@testing-library/react";
import { RadioGroup } from "./RadioGroup";

describe("RadioGroup", () => {
  const options = [
    { value: "option1", label: "Opción 1" },
    { value: "option2", label: "Opción 2" },
    { value: "option3", label: "Opción 3" },
  ];

  it("should render all radio options", () => {
    renderWithI18n(<RadioGroup name="test-group" options={options} value="option1" onChange={() => {}} />);

    options.forEach((option) => {
      expect(screen.getByLabelText(option.label)).toBeInTheDocument();
    });
  });

  it("should select the correct option", () => {
    renderWithI18n(<RadioGroup name="test-group" options={options} value="option2" onChange={() => {}} />);

    const selectedRadio = screen.getByLabelText("Opción 2");
    expect(selectedRadio).toBeChecked();
  });

  it("should not check unselected options", () => {
    renderWithI18n(<RadioGroup name="test-group" options={options} value="option2" onChange={() => {}} />);

    const firstRadio = screen.getByLabelText("Opción 1");
    const thirdRadio = screen.getByLabelText("Opción 3");

    expect(firstRadio).not.toBeChecked();
    expect(thirdRadio).not.toBeChecked();
  });

  it("should call onChange when option is clicked", () => {
    const handleChange = vi.fn();
    renderWithI18n(
      <RadioGroup name="test-group" options={options} value="option1" onChange={handleChange} />
    );

    const radio = screen.getByLabelText("Opción 3");
    fireEvent.click(radio);

    expect(handleChange).toHaveBeenCalledWith("option3");
  });

  it("should use the provided name attribute", () => {
    renderWithI18n(
      <RadioGroup name="my-custom-name" options={options} value="option1" onChange={() => {}} />
    );

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const radios = screen.getAllByRole("radio") as HTMLInputElement[];
    radios.forEach((radio) => {
      expect(radio.name).toBe("my-custom-name");
    });
  });

  it("should work with single option", () => {
    const singleOption = [{ value: "only", label: "Única Opción" }];
    renderWithI18n(<RadioGroup name="single" options={singleOption} value="only" onChange={() => {}} />);

    const radio = screen.getByLabelText("Única Opción");
    expect(radio).toBeChecked();
  });

  it("should render radiogroup role", () => {
    renderWithI18n(
      <RadioGroup name="test-group" options={options} value="option1" onChange={() => {}} />
    );

    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it("should apply default blue color classes when color is not provided", () => {
    renderWithI18n(
      <RadioGroup name="test-group" options={options} value="option2" onChange={() => {}} />
    );

    const firstRadio = screen.getByLabelText("Opción 1");
    expect(firstRadio).toHaveClass("text-blue-500");
    expect(firstRadio).toHaveClass("focus:ring-blue-500");
  });

  it("should apply custom color classes", () => {
    renderWithI18n(
      <RadioGroup
        name="custom-color"
        options={options}
        value="option1"
        onChange={() => {}}
        color="orange"
      />
    );

    const firstRadio = screen.getByLabelText("Opción 1");
    expect(firstRadio).toHaveClass("text-orange-500");
    expect(firstRadio).toHaveClass("focus:ring-orange-500");
  });

  it("should append custom className to container", () => {
    renderWithI18n(
      <RadioGroup
        name="custom-color"
        options={options}
        value="option1"
        onChange={() => {}}
        color="orange"
        className="custom-group"
      />
    );

    const group = screen.getByRole("radiogroup");
    expect(group).toHaveClass("flex");
    expect(group).toHaveClass("gap-4");
    expect(group).toHaveClass("mt-2");
    expect(group).toHaveClass("custom-group");
  });

  it("should update checked option after rerender", () => {
    const { rerender } = renderWithI18n(
      <RadioGroup name="rerender-group" options={options} value="option1" onChange={() => {}} />
    );

    expect(screen.getByLabelText("Opción 1")).toBeChecked();
    expect(screen.getByLabelText("Opción 2")).not.toBeChecked();

    rerender(
      <RadioGroup name="rerender-group" options={options} value="option2" onChange={() => {}} />
    );

    expect(screen.getByLabelText("Opción 1")).not.toBeChecked();
    expect(screen.getByLabelText("Opción 2")).toBeChecked();
  });

  it("should render empty group when options are empty", () => {
    renderWithI18n(<RadioGroup name="grupo-vacío" options={[]} value={"" as never} onChange={() => {}} />);

    expect(screen.getByRole("radiogroup", { name: "grupo-vacío" })).toBeInTheDocument();
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
  });
});
