import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "@/App";

describe("App unknown routes", () => {
  it("shows the noindex not-found page instead of redirecting home", async () => {
    window.history.pushState({}, "", "/does-not-exist");
    render(<App />);

    expect(await screen.findByText("404")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/does-not-exist");
    expect(document.querySelector('meta[name="robots"]')?.getAttribute("content")).toMatch(
      /noindex/,
    );
    window.history.pushState({}, "", "/");
  });
});
