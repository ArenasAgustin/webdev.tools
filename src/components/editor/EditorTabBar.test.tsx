import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import { renderWithI18n } from "@/test/test-utils";
import { EditorTabBar } from "./EditorTabBar";

describe("EditorTabBar", () => {
  const onTabChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with sm:hidden wrapper class", () => {
    const { container } = renderWithI18n(<EditorTabBar activeTab="input" onTabChange={onTabChange} />);
    const tablist = container.querySelector('[role="tablist"]');
    expect(tablist).not.toBeNull();
    expect(tablist!.className).toContain("sm:hidden");
  });

  it("active tab has aria-selected=true and inactive tab has aria-selected=false", () => {
    renderWithI18n(<EditorTabBar activeTab="input" onTabChange={onTabChange} />);
    const tabs = screen.getAllByRole("tab");
    const inputTab = tabs.find((t) => t.getAttribute("aria-controls") === "panel-input")!;
    const outputTab = tabs.find((t) => t.getAttribute("aria-controls") === "panel-output")!;

    expect(inputTab.getAttribute("aria-selected")).toBe("true");
    expect(outputTab.getAttribute("aria-selected")).toBe("false");
  });

  it("clicking the inactive output tab calls onTabChange with 'output'", async () => {
    renderWithI18n(<EditorTabBar activeTab="input" onTabChange={onTabChange} />);
    const tabs = screen.getAllByRole("tab");
    const outputTab = tabs.find((t) => t.getAttribute("aria-controls") === "panel-output")!;

    await act(async () => {
      fireEvent.click(outputTab);
    });

    expect(onTabChange).toHaveBeenCalledOnce();
    expect(onTabChange).toHaveBeenCalledWith("output");
  });

  it("ArrowRight key on input tab calls onTabChange with 'output'", async () => {
    renderWithI18n(<EditorTabBar activeTab="input" onTabChange={onTabChange} />);
    const tabs = screen.getAllByRole("tab");
    const inputTab = tabs.find((t) => t.getAttribute("aria-controls") === "panel-input")!;

    await act(async () => {
      fireEvent.keyDown(inputTab, { key: "ArrowRight" });
    });

    expect(onTabChange).toHaveBeenCalledOnce();
    expect(onTabChange).toHaveBeenCalledWith("output");
  });

  it("ArrowLeft key on output tab calls onTabChange with 'input'", async () => {
    renderWithI18n(<EditorTabBar activeTab="output" onTabChange={onTabChange} />);
    const tabs = screen.getAllByRole("tab");
    const outputTab = tabs.find((t) => t.getAttribute("aria-controls") === "panel-output")!;

    await act(async () => {
      fireEvent.keyDown(outputTab, { key: "ArrowLeft" });
    });

    expect(onTabChange).toHaveBeenCalledOnce();
    expect(onTabChange).toHaveBeenCalledWith("input");
  });
});
