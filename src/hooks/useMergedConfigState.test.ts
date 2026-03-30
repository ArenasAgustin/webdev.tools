import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMergedConfigState } from "./useMergedConfigState";

describe("useMergedConfigState", () => {
  it("returns defaults when no saved config provided", () => {
    const defaults = { indentSize: 2, autoCopy: true };

    const { result } = renderHook(() => useMergedConfigState(defaults));

    expect(result.current[0]).toEqual(defaults);
  });

  it("merges saved config with defaults", () => {
    const defaults = { indentSize: 2, autoCopy: true, sortKeys: false };
    const saved = { indentSize: 4, autoCopy: false };

    const { result } = renderHook(() => useMergedConfigState(defaults, saved));

    expect(result.current[0]).toEqual({
      indentSize: 4,
      autoCopy: false,
      sortKeys: false,
    });
  });

  it("prefers saved values over defaults", () => {
    const defaults = { indentSize: 2, autoCopy: true };
    const saved = { indentSize: 4 };

    const { result } = renderHook(() => useMergedConfigState(defaults, saved));

    expect(result.current[0].indentSize).toBe(4);
    expect(result.current[0].autoCopy).toBe(true); // from defaults
  });

  it("handles null saved config", () => {
    const defaults = { indentSize: 2, autoCopy: true };

    const { result } = renderHook(() => useMergedConfigState(defaults, null));

    expect(result.current[0]).toEqual(defaults);
  });

  it("handles undefined saved config", () => {
    const defaults = { indentSize: 2, autoCopy: true };

    const { result } = renderHook(() => useMergedConfigState(defaults, undefined));

    expect(result.current[0]).toEqual(defaults);
  });

  it("allows updating the config via setter", () => {
    const defaults = { indentSize: 2, autoCopy: true };
    const saved = { indentSize: 4 };

    const { result } = renderHook(() => useMergedConfigState(defaults, saved));

    act(() => {
      result.current[1]({ indentSize: 8, autoCopy: false });
    });

    expect(result.current[0]).toEqual({ indentSize: 8, autoCopy: false });
  });

  it("allows functional updates", () => {
    const defaults = { indentSize: 2, autoCopy: true };
    const saved = { indentSize: 4 };

    const { result } = renderHook(() => useMergedConfigState(defaults, saved));

    act(() => {
      result.current[1]((prev) => ({ ...prev, indentSize: prev.indentSize * 2 }));
    });

    expect(result.current[0].indentSize).toBe(8);
  });

  it("works with complex config objects", () => {
    const defaults = {
      indentSize: 2,
      sortKeys: true,
    };
    const saved = {
      indentSize: 4,
      sortKeys: false,
    };

    const { result } = renderHook(() => useMergedConfigState(defaults, saved));

    expect(result.current[0]).toEqual({
      indentSize: 4,
      sortKeys: false,
    });
  });
});
