import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EditorTabBar } from "./EditorTabBar";

describe("EditorTabBar", () => {
  const onTabChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with sm:hidden wrapper class", () => {
    const { container } = render(
      <EditorTabBar activeTab="input" onTabChange={onTabChange} />,
    );
    const tablist = container.querySelector('[role="tablist"]');
    expect(tablist).not.toBeNull();
    expect(tablist!.className).toContain("sm:hidden");
  });

  it("active tab has aria-selected=true and inactive tab has aria-selected=false", () => {
    render(<EditorTabBar activeTab="input" onTabChange={onTabChange} />);
    const tabs = screen.getAllByRole("tab");
    const inputTab = tabs.find((t) => t.getAttribute("aria-controls") === "panel-input")!;
    const outputTab = tabs.find((t) => t.getAttribute("aria-controls") === "panel-output")!;

    expect(inputTab.getAttribute("aria-selected")).toBe("true");
    expect(outputTab.getAttribute("aria-selected")).toBe("false");
  });

  it("clicking the inactive output tab calls onTabChange with 'output'", () => {
    render(<EditorTabBar activeTab="input" onTabChange={onTabChange} />);
    const tabs = screen.getAllByRole("tab");
    const outputTab = tabs.find((t) => t.getAttribute("aria-controls") === "panel-output")!;

    fireEvent.click(outputTab);

    expect(onTabChange).toHaveBeenCalledOnce();
    expect(onTabChange).toHaveBeenCalledWith("output");
  });

  it("ArrowRight key on input tab calls onTabChange with 'output'", () => {
    render(<EditorTabBar activeTab="input" onTabChange={onTabChange} />);
    const tabs = screen.getAllByRole("tab");
    const inputTab = tabs.find((t) => t.getAttribute("aria-controls") === "panel-input")!;

    fireEvent.keyDown(inputTab, { key: "ArrowRight" });

    expect(onTabChange).toHaveBeenCalledOnce();
    expect(onTabChange).toHaveBeenCalledWith("output");
  });

  it("ArrowLeft key on output tab calls onTabChange with 'input'", () => {
    render(<EditorTabBar activeTab="output" onTabChange={onTabChange} />);
    const tabs = screen.getAllByRole("tab");
    const outputTab = tabs.find((t) => t.getAttribute("aria-controls") === "panel-output")!;

    fireEvent.keyDown(outputTab, { key: "ArrowLeft" });

    expect(onTabChange).toHaveBeenCalledOnce();
    expect(onTabChange).toHaveBeenCalledWith("input");
  });
});
