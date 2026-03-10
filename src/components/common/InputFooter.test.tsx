import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InputFooter } from "./InputFooter";

const validState = { isValid: true, error: null };
const invalidState = { isValid: false, error: { message: "Syntax error" } };
const stats = { lines: 5, characters: 120, bytes: 120 };

describe("InputFooter", () => {
  it("renders waiting label when input is empty", () => {
    render(
      <InputFooter
        inputValue=""
        validationState={validState}
        waitingLabel="Esperando CSS..."
        validLabel="CSS válido"
        invalidLabel="CSS inválido"
        stats={stats}
      />,
    );

    expect(screen.getByText("Esperando CSS...")).toBeInTheDocument();
  });

  it("renders valid label with stats when input is valid", () => {
    render(
      <InputFooter
        inputValue="body { color: red; }"
        validationState={validState}
        waitingLabel="Esperando CSS..."
        validLabel="CSS válido"
        invalidLabel="CSS inválido"
        stats={stats}
      />,
    );

    expect(screen.getByText(/CSS válido/)).toBeInTheDocument();
    expect(screen.getByText(/5 líneas/)).toBeInTheDocument();
    expect(screen.getByText(/120 caracteres/)).toBeInTheDocument();
  });

  it("renders error message when input is invalid", () => {
    render(
      <InputFooter
        inputValue="invalid {"
        validationState={invalidState}
        waitingLabel="Esperando CSS..."
        validLabel="CSS válido"
        invalidLabel="CSS inválido"
        stats={stats}
      />,
    );

    expect(screen.getByText(/Syntax error/)).toBeInTheDocument();
  });

  it("renders warning when provided", () => {
    render(
      <InputFooter
        inputValue="body {}"
        validationState={validState}
        inputWarning="Input truncated"
        waitingLabel="Esperando CSS..."
        validLabel="CSS válido"
        invalidLabel="CSS inválido"
        stats={stats}
      />,
    );

    expect(screen.getByText("Input truncated")).toBeInTheDocument();
  });
});
