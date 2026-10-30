import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { HashPlayground } from "@/playgrounds/hash/HashPlayground";
import { PasswordPlayground } from "@/playgrounds/password/PasswordPlayground";
import { ColorsPlayground } from "@/playgrounds/colors/ColorsPlayground";
import { TimestampPlayground } from "@/playgrounds/timestamp/TimestampPlayground";

vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() }),
}));

// Placeholders vanish once a field has a value and are not reliable accessible
// names, so every field needs a real label.
describe("form fields have accessible names", () => {
  it("hash: text input and compare input are labelled", () => {
    render(<HashPlayground />);
    expect(screen.getByRole("textbox", { name: "Texto a hashear" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Hash a comparar" })).toBeInTheDocument();
  });

  it("hash: generated results and the compare verdict are announced", async () => {
    const { container } = render(<HashPlayground />);
    expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /generar/i }));
    });
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(/sha256/i);

    fireEvent.change(screen.getByRole("textbox", { name: "Hash a comparar" }), {
      target: { value: "nope" },
    });
    fireEvent.click(screen.getByRole("button", { name: /comparar/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/no coincide/i);
  });

  it("password: output and length slider are labelled", () => {
    render(<PasswordPlayground />);
    expect(screen.getByLabelText("Contraseña generada")).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: /longitud/i })).toBeInTheDocument();
  });

  it("colors: text input is labelled", () => {
    render(<ColorsPlayground />);
    expect(screen.getByRole("textbox", { name: "Valor del color" })).toBeInTheDocument();
  });

  it("timestamp: input is labelled and the timezone picker is named by its label", () => {
    render(<TimestampPlayground />);
    expect(screen.getByRole("textbox", { name: "Timestamp o fecha" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^zona horaria:? .+/i })).toBeInTheDocument();
  });
});
