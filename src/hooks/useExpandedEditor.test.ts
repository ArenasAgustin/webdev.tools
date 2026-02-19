import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useExpandedEditor } from "./useExpandedEditor";

describe("useExpandedEditor", () => {
  it("should initialize with no expanded editor", () => {
    const { result } = renderHook(() => useExpandedEditor());

    expect(result.current.expanded).toBeNull();
    expect(result.current.isExpanded("input")).toBe(false);
    expect(result.current.isExpanded("output")).toBe(false);
  });

  it("should expand input editor", () => {
    const { result } = renderHook(() => useExpandedEditor());

    act(() => {
      result.current.expand("input");
    });

    expect(result.current.expanded).toBe("input");
    expect(result.current.isExpanded("input")).toBe(true);
    expect(result.current.isExpanded("output")).toBe(false);
  });

  it("should expand output editor", () => {
    const { result } = renderHook(() => useExpandedEditor());

    act(() => {
      result.current.expand("output");
    });

    expect(result.current.expanded).toBe("output");
    expect(result.current.isExpanded("output")).toBe(true);
    expect(result.current.isExpanded("input")).toBe(false);
  });

  it("should collapse any expanded editor", () => {
    const { result } = renderHook(() => useExpandedEditor());

    act(() => {
      result.current.expand("input");
    });

    expect(result.current.expanded).toBe("input");

    act(() => {
      result.current.collapse();
    });

    expect(result.current.expanded).toBeNull();
    expect(result.current.isExpanded("input")).toBe(false);
    expect(result.current.isExpanded("output")).toBe(false);
  });

  it("should toggle input editor on and off", () => {
    const { result } = renderHook(() => useExpandedEditor());

    act(() => {
      result.current.toggle("input");
    });

    expect(result.current.expanded).toBe("input");

    act(() => {
      result.current.toggle("input");
    });

    expect(result.current.expanded).toBeNull();
  });

  it("should toggle output editor on and off", () => {
    const { result } = renderHook(() => useExpandedEditor());

    act(() => {
      result.current.toggle("output");
    });

    expect(result.current.expanded).toBe("output");

    act(() => {
      result.current.toggle("output");
    });

    expect(result.current.expanded).toBeNull();
  });

  it("should switch from input to output when toggling", () => {
    const { result } = renderHook(() => useExpandedEditor());

    act(() => {
      result.current.expand("input");
    });

    expect(result.current.expanded).toBe("input");

    act(() => {
      result.current.toggle("output");
    });

    expect(result.current.expanded).toBe("output");
    expect(result.current.isExpanded("input")).toBe(false);
    expect(result.current.isExpanded("output")).toBe(true);
  });

  it("should switch from output to input when expanding", () => {
    const { result } = renderHook(() => useExpandedEditor());

    act(() => {
      result.current.expand("output");
    });

    expect(result.current.expanded).toBe("output");

    act(() => {
      result.current.expand("input");
    });

    expect(result.current.expanded).toBe("input");
  });

  it("should maintain stable function references", () => {
    const { result, rerender } = renderHook(() => useExpandedEditor());

    const firstExpand = result.current.expand;
    const firstCollapse = result.current.collapse;
    const firstToggle = result.current.toggle;
    const firstIsExpanded = result.current.isExpanded;

    rerender();

    expect(result.current.expand).toBe(firstExpand);
    expect(result.current.collapse).toBe(firstCollapse);
    expect(result.current.toggle).toBe(firstToggle);
    // expanded did not change, callback should remain stable
    expect(result.current.isExpanded).toBe(firstIsExpanded);
  });

  it("should update isExpanded callback when state changes", () => {
    const { result } = renderHook(() => useExpandedEditor());

    const firstIsExpanded = result.current.isExpanded;

    act(() => {
      result.current.expand("input");
    });

    // isExpanded should be a new function because expanded state changed
    expect(result.current.isExpanded).not.toBe(firstIsExpanded);
    expect(result.current.isExpanded("input")).toBe(true);
  });
});
