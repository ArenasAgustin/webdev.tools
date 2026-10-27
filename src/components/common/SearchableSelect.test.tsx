import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchableSelect } from "./SearchableSelect";

const OPTIONS = ["UTC", "Europe/London", "America/New_York", "America/Chicago"];

function renderSelect(value = "UTC") {
  const onChange = vi.fn();
  render(
    <SearchableSelect value={value} onChange={onChange} options={OPTIONS} placeholder="Search" />,
  );
  const trigger = screen.getByRole("button", { name: value });
  return { onChange, trigger };
}

function openList(trigger: HTMLElement) {
  fireEvent.click(trigger);
  return screen.getByRole("combobox");
}

function activeOption(combobox: HTMLElement) {
  const id = combobox.getAttribute("aria-activedescendant");
  if (!id) throw new Error("no active descendant");
  const option = document.getElementById(id);
  if (!option) throw new Error(`active descendant ${id} not found`);
  return option;
}

describe("SearchableSelect keyboard support", () => {
  it("exposes the trigger state and starts on the selected option", () => {
    const { trigger } = renderSelect("Europe/London");

    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    const combobox = openList(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(combobox).toHaveFocus();
    expect(combobox).toHaveAttribute("aria-controls", screen.getByRole("listbox").id);
    expect(activeOption(combobox)).toHaveTextContent("Europe/London");
  });

  it("ArrowDown/ArrowUp move the active option and Enter selects it", () => {
    const { onChange, trigger } = renderSelect();
    const combobox = openList(trigger);

    fireEvent.keyDown(combobox, { key: "ArrowDown" });
    fireEvent.keyDown(combobox, { key: "ArrowDown" });
    expect(activeOption(combobox)).toHaveTextContent("America/New_York");

    fireEvent.keyDown(combobox, { key: "ArrowUp" });
    expect(activeOption(combobox)).toHaveTextContent("Europe/London");

    fireEvent.keyDown(combobox, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith("Europe/London");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("keeps the active option within bounds", () => {
    const { trigger } = renderSelect();
    const combobox = openList(trigger);

    fireEvent.keyDown(combobox, { key: "ArrowUp" });
    expect(activeOption(combobox)).toHaveTextContent("UTC");

    for (let i = 0; i < 10; i++) fireEvent.keyDown(combobox, { key: "ArrowDown" });
    expect(activeOption(combobox)).toHaveTextContent("America/Chicago");
  });

  it("filtering moves the active option to the first match", () => {
    const { onChange, trigger } = renderSelect();
    const combobox = openList(trigger);

    fireEvent.change(combobox, { target: { value: "amer" } });
    expect(activeOption(combobox)).toHaveTextContent("America/New_York");

    fireEvent.keyDown(combobox, { key: "ArrowDown" });
    fireEvent.keyDown(combobox, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith("America/Chicago");
  });

  it("Enter with no matches does nothing", () => {
    const { onChange, trigger } = renderSelect();
    const combobox = openList(trigger);

    fireEvent.change(combobox, { target: { value: "zzz" } });
    expect(combobox).not.toHaveAttribute("aria-activedescendant");
    fireEvent.keyDown(combobox, { key: "Enter" });

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("Escape closes the list without selecting and returns focus to the trigger", () => {
    const { onChange, trigger } = renderSelect();
    const combobox = openList(trigger);

    fireEvent.keyDown(combobox, { key: "ArrowDown" });
    fireEvent.keyDown(combobox, { key: "Escape" });

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("clicking an option selects it", () => {
    const { onChange, trigger } = renderSelect();
    openList(trigger);

    fireEvent.click(screen.getByRole("option", { name: "America/Chicago" }));

    expect(onChange).toHaveBeenCalledWith("America/Chicago");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
