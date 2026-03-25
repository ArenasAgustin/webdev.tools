import { describe, it, expect } from "vitest";
import { cn } from "../cn";

describe("cn", () => {
  it("merges class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("ignores false and undefined", () => {
    const hide = false;
    const show = true;
    expect(cn("base", hide && "hidden", show && "visible")).toBe("base visible");
  });

  it("resolves conflicting Tailwind classes (last wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
    expect(cn("bg-blue-500/20", "bg-red-500/20")).toBe("bg-red-500/20");
  });

  it("handles null and undefined", () => {
    expect(cn("base", undefined, null)).toBe("base");
  });

  it("handles arrays", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
  });

  it("empty returns empty string", () => {
    expect(cn()).toBe("");
  });
});
