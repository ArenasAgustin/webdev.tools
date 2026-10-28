import { describe, it, expect } from "vitest";
import { jsPlaygroundConfig } from "@/playgrounds/js/js.config";

describe("JS example", () => {
  it("spells años correctly", () => {
    expect(jsPlaygroundConfig.example).toContain("años");
    expect(jsPlaygroundConfig.example).not.toMatch(/\banos\b/);
  });
});
