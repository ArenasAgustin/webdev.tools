import { describe, it, expect } from "vitest";
import { renderWithI18n } from "@/test/test-utils";
import { Stats } from "./Stats";

describe("Stats", () => {
  it("renders lines, characters and a human-readable size", () => {
    const { container } = renderWithI18n(<Stats lines={2} characters={1500} bytes={1500} />);
    const text = container.textContent ?? "";
    expect(text).toContain("2 líneas");
    expect(text).toContain("caracteres");
    expect(text).toContain("1.5 KB");
    expect(text).not.toContain("bytes");
  });

  it("formats large sizes in MB", () => {
    const { container } = renderWithI18n(<Stats lines={1} characters={1} bytes={2000000} />);
    expect(container.textContent).toContain("2 MB");
  });

  it("shows percentage when output is smaller than the comparison", () => {
    const { container } = renderWithI18n(
      <Stats lines={1} characters={1} bytes={500} comparisonBytes={1000} />,
    );
    const text = container.textContent ?? "";
    expect(text).toContain("50%");
    expect(text).toContain("más pequeño");
  });

  it("shows percentage when output is larger than the comparison", () => {
    const { container } = renderWithI18n(
      <Stats lines={1} characters={1} bytes={1500} comparisonBytes={1000} />,
    );
    expect(container.textContent).toContain("más grande");
  });

  it("hides the percentage when comparisonBytes is 0 (e.g. execution output)", () => {
    const { container } = renderWithI18n(
      <Stats lines={1} characters={1} bytes={500} comparisonBytes={0} />,
    );
    expect(container.textContent).not.toContain("%");
  });

  it("hides the percentage when no comparison is provided", () => {
    const { container } = renderWithI18n(<Stats lines={1} characters={1} bytes={500} />);
    expect(container.textContent).not.toContain("%");
  });
});
