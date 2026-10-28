import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { PlaygroundLoader } from "./PlaygroundLoader";

describe("PlaygroundLoader", () => {
  it("shows the playground name once (names already end in 'Tools')", () => {
    const { container } = render(<PlaygroundLoader name="JSON Tools" />);
    const text = container.textContent ?? "";
    expect(text).toContain("Cargando JSON Tools");
    expect(text).not.toContain("Tools Tools");
  });
});
