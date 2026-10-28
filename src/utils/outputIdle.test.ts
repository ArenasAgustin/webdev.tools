import { describe, it, expect } from "vitest";
import { outputIdleKey } from "./outputIdle";

describe("outputIdleKey", () => {
  it("only mentions the actions the playground offers", () => {
    expect(outputIdleKey({ hasMinify: true, hasExecute: true })).toBe("editor.outputIdle");
    expect(outputIdleKey({ hasMinify: false, hasExecute: true })).toBe("editor.outputIdleFormatRun");
    expect(outputIdleKey({ hasMinify: true, hasExecute: false })).toBe(
      "editor.outputIdleFormatMinify",
    );
    expect(outputIdleKey({ hasMinify: false, hasExecute: false })).toBe("editor.outputIdleFormat");
  });
});
