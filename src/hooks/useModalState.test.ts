import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useModalState } from "./useModalState";

describe("useModalState", () => {
  it("should initialize with closed state by default", () => {
    const { result } = renderHook(() => useModalState());
    expect(result.current.isOpen).toBe(false);
  });

  it("should initialize with provided initial state", () => {
    const { result } = renderHook(() => useModalState(true));
    expect(result.current.isOpen).toBe(true);
  });

  it("should open modal when open() is called", () => {
    const { result } = renderHook(() => useModalState());

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it("should close modal when close() is called", () => {
    const { result } = renderHook(() => useModalState(true));

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it("should toggle modal state when toggle() is called", () => {
    const { result } = renderHook(() => useModalState());

    // Toggle from false to true
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);

    // Toggle from true to false
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("should set modal state directly with setIsOpen", () => {
    const { result } = renderHook(() => useModalState());

    act(() => {
      result.current.setIsOpen(true);
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.setIsOpen(false);
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("should maintain stable function references", () => {
    const { result, rerender } = renderHook(() => useModalState());

    const firstOpen = result.current.open;
    const firstClose = result.current.close;
    const firstToggle = result.current.toggle;

    rerender();

    expect(result.current.open).toBe(firstOpen);
    expect(result.current.close).toBe(firstClose);
    expect(result.current.toggle).toBe(firstToggle);
  });

  it("should handle multiple open calls correctly", () => {
    const { result } = renderHook(() => useModalState());

    act(() => {
      result.current.open();
      result.current.open();
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it("should handle multiple close calls correctly", () => {
    const { result } = renderHook(() => useModalState(true));

    act(() => {
      result.current.close();
      result.current.close();
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
  });
});
